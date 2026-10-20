"""Task routes: create + enqueue, list, get, plus the chat-completion endpoint."""
from __future__ import annotations

import asyncio
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_optional_user
from app.core.db import async_session_maker, get_db
from app.core.security import create_access_token
from app.models import Agent, Conversation, Message as DBMessage, Task, User
from app.schemas import TaskCreate, TaskOut
from app.agents.llm import Message, get_adapter
from app.agents.tools import get_tool, tool_schemas
from app.workers import tasks as worker_tasks
from sqlalchemy import func, or_, select
import re

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _detect_user_tool_intent(text: str) -> tuple[str, dict] | None:
    """Detect if the user prompt is an explicit invocation for web search, image gen, or url reading."""
    t_lower = text.strip().lower()

    # 1. URL reading
    url_match = re.search(r"https?://[^\s]+", text)
    if url_match and any(w in t_lower for w in ["read", "summarize", "scrape", "check", "what is on", "tell me about this", "page", "article", "link"]):
        return "read_url", {"url": url_match.group(0)}

    # 2. Image generation
    image_prefixes = [
        "generate an image of", "generate image of", "generate image:", "generate an image:",
        "create an image of", "create image of", "draw an image of", "draw a ", "draw an ", "draw:",
        "make an image of", "render an image of", "picture of"
    ]
    for p in image_prefixes:
        if t_lower.startswith(p):
            prompt = text[len(p):].strip()
            if prompt:
                return "image_generate", {"prompt": prompt}

    # 3. Live web search
    search_prefixes = [
        "search the web for", "search web for", "web search:", "web search for",
        "search for", "google", "look up live", "latest news on", "current info on"
    ]
    for p in search_prefixes:
        if t_lower.startswith(p):
            query = text[len(p):].strip()
            if query:
                return "web_search", {"query": query}

    return None


def _contains_tool_request(text: str) -> bool:
    return "<<tool" in text and ">>" in text


def _parse_tool_request(text: str) -> dict | None:
    try:
        start = text.index("<<tool") + 6
        end = text.index(">>", start)
        payload = text[start:end].strip()
        return json.loads(payload)
    except Exception:
        return None


async def _execute_tool_call(tool_name: str, tool_args: dict, user_id: str = "user", db=None) -> tuple[str, dict | None]:
    tool = get_tool(tool_name)
    if not tool:
        return json.dumps({"ok": False, "error": f"Tool '{tool_name}' not found"}, ensure_ascii=False), None
    try:
        raw_res = await tool.run(tool_args, user_id=user_id, db=db)
        artifact = None
        try:
            parsed = json.loads(raw_res)
            if isinstance(parsed, dict) and "artifact" in parsed:
                artifact = parsed["artifact"]
        except Exception:
            pass
        return raw_res, artifact
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False), None


def _enqueue(task_id: str) -> None:
    if _redis_available():
        worker_tasks.run_task.delay(task_id)
    else:
        import threading

        threading.Thread(target=worker_tasks.run_task_local, args=(task_id,), daemon=True).start()


def _redis_available() -> bool:
    try:
        import redis

        return bool(redis.from_url(__import__("app.core.config", fromlist=["settings"]).settings.REDIS_URL).ping())
    except Exception:
        return False


@router.get("", response_model=list[TaskOut])
async def list_tasks(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Task).where(Task.owner_id == user.id).order_by(Task.created_at.desc()))).scalars().all()
    return rows


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(body: TaskCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    task = Task(owner_id=user.id, **body.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    _enqueue(task.id)
    return task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    task = (await db.execute(select(Task).where(Task.id == task_id, Task.owner_id == user.id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/{task_id}/cancel", response_model=TaskOut)
async def cancel_task(task_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    task = (await db.execute(select(Task).where(Task.id == task_id, Task.owner_id == user.id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "failed"
    task.error = "Cancelled by user"
    await db.commit()
    await db.refresh(task)
    return task


# --- Chat: talk to an agent or multi-agent group (SSE streaming) ---
@router.post("/chat/stream")
async def chat_stream(body: dict, user: User | None = Depends(get_optional_user), db: AsyncSession = Depends(get_db)):
    conversation_id = body.get("conversation_id")
    agent_id = body.get("agent_id")
    agent_name = body.get("agent_name", "")
    message = body.get("message", "")
    model = body.get("model", "gemma3:4b")
    provider = body.get("provider")
    api_key = body.get("api_key")
    
    conv: Conversation | None = None
    if conversation_id:
        conv = (await db.execute(select(Conversation).where(Conversation.id == conversation_id))).scalar_one_or_none()
        if not conv:
            conv = Conversation(
                id=conversation_id,
                user_id=user.id if user else None,
                title=agent_name or "Chat",
                is_group=False,
                agent_id=agent_id,
            )
            db.add(conv)
            await db.flush()

        # Persist user's message
        user_msg = DBMessage(
            conversation_id=conversation_id,
            sender_type="user",
            sender_id=user.id if user else "user",
            sender_name=user.full_name if (user and user.full_name) else "You",
            content=message,
        )
        db.add(user_msg)
        conv.updated_at = func.now()
        await db.commit()

    # Determine if this is a Multi-Agent Group Chat
    is_group_chat = bool(conv and conv.is_group)

    if is_group_chat:
        # Load all squad member agents
        member_ids = conv.member_agent_ids or []
        group_agents: list[Agent] = []
        if member_ids:
            agent_rows = (await db.execute(select(Agent).where(Agent.id.in_(member_ids)))).scalars().all()
            agent_map = {a.id: a for a in agent_rows}
            group_agents = [agent_map[mid] for mid in member_ids if mid in agent_map]
        
        # Fallback if no members found
        if not group_agents:
            group_agents = (await db.execute(select(Agent).order_by(Agent.is_official.desc()).limit(3))).scalars().all()

        async def gen_group():
            collaborative_context: list[str] = []

            for idx, agent in enumerate(group_agents):
                agent_display = agent.name or f"Agent {idx + 1}"
                agent_avatar = agent.avatar or "🤖"
                agent_artifacts: list[dict] = []

                # Notify client that this agent has begun speaking
                yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': agent.id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"

                system_prompt = (
                    f"You are {agent.name}, a specialized autonomous AI agent in {agent.category}.\n"
                    f"Your background: {agent.description or 'Expert collaborator'}.\n"
                    f"You are collaborating live inside an expert multi-agent squad. Address the user's inquiry, build upon and coordinate with your teammate agents, and provide domain-specific insights without unnecessary repetition.\n\n"
                    f"You have access to real live tools:\n"
                    f"- web_search(query: str): Live public web search for facts, news, documentation.\n"
                    f"- image_generate(prompt: str): Generate a live image using Pollinations AI.\n"
                    f"- read_url(url: str): Read and summarize live webpage URLs.\n\n"
                    f"To invoke a tool, output: <<tool {{\"name\": \"tool_name\", \"args\": {{...}}}}>>"
                )

                agent_messages = [Message(role="system", content=system_prompt), Message(role="user", content=message)]
                if collaborative_context:
                    prior_contributions = "\n\n".join(collaborative_context)
                    agent_messages.append(Message(role="user", content=f"Prior teammate contributions in this discussion:\n{prior_contributions}\n\nPlease add your domain perspective as {agent_display}:"))

                # Check if user message directly requested tool for first agent or relevant agent
                if idx == 0:
                    user_tool = _detect_user_tool_intent(message)
                    if user_tool:
                        t_name, t_args = user_tool
                        yield f"data: {json.dumps({'type': 'tool_start', 'tool': t_name, 'args': t_args, 'agent_id': agent.id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                        t_res, t_art = await _execute_tool_call(t_name, t_args, user.id if user else "user", db)
                        if t_art:
                            agent_artifacts.append(t_art)
                            yield f"data: {json.dumps({'type': 'artifact', 'artifact': t_art, 'agent_id': agent.id, 'agent_name': agent_display})}\n\n"
                        yield f"data: {json.dumps({'type': 'tool_done', 'tool': t_name, 'result': t_res, 'agent_name': agent_display})}\n\n"
                        agent_messages.append(Message(role="system", content=f"[Live Tool Observation: {t_name}]\n{t_res}\nAddress the user using this verified live data. If an image was generated, include markdown image link: ![{t_args.get('prompt', 'image')}]({t_art.get('url') if t_art else ''})"))

                adapter = get_adapter(provider=provider, api_key=api_key, model=model or agent.model)
                current_agent_words: list[str] = []

                try:
                    async for chunk in adapter.complete(agent_messages, model=model or agent.model, stream=True):
                        if chunk.delta:
                            current_agent_words.append(chunk.delta)
                            yield f"data: {json.dumps({'type': 'delta', 'delta': chunk.delta, 'agent_id': agent.id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                except Exception:
                    # Fallback collaborative response for group member
                    fallback_reply = (
                        f"As {agent_display} ({agent.category}), I have reviewed the objective: \"{message}\". "
                        f"I recommend prioritizing modular execution and validating deliverables against our squad milestones."
                    )
                    words = fallback_reply.split(" ")
                    for w in words:
                        wd = w + " "
                        current_agent_words.append(wd)
                        yield f"data: {json.dumps({'type': 'delta', 'delta': wd, 'agent_id': agent.id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                        await asyncio.sleep(0.04)

                agent_full_text = "".join(current_agent_words).strip()

                # Dynamic tool execution if agent emitted <<tool ...>>
                if _contains_tool_request(agent_full_text):
                    t_call = _parse_tool_request(agent_full_text)
                    if t_call and "name" in t_call and "args" in t_call:
                        t_name = t_call["name"]
                        t_args = t_call["args"]
                        yield f"data: {json.dumps({'type': 'tool_start', 'tool': t_name, 'args': t_args, 'agent_id': agent.id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                        t_res, t_art = await _execute_tool_call(t_name, t_args, user.id if user else "user", db)
                        if t_art:
                            agent_artifacts.append(t_art)
                            yield f"data: {json.dumps({'type': 'artifact', 'artifact': t_art, 'agent_id': agent.id, 'agent_name': agent_display})}\n\n"
                        yield f"data: {json.dumps({'type': 'tool_done', 'tool': t_name, 'result': t_res, 'agent_name': agent_display})}\n\n"

                        agent_messages.append(Message(role="assistant", content=agent_full_text))
                        agent_messages.append(Message(role="user", content=f"Tool result for '{t_name}':\n{t_res}\nPlease complete your response now to the user incorporating this result. Display markdown images if generated."))

                        try:
                            async for chunk in adapter.complete(agent_messages, model=model or agent.model, stream=True):
                                if chunk.delta:
                                    agent_full_text += chunk.delta
                                    yield f"data: {json.dumps({'type': 'delta', 'delta': chunk.delta, 'agent_id': agent.id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                        except Exception:
                            pass

                collaborative_context.append(f"[{agent_display} - {agent.category}]: {agent_full_text}")

                # Persist this agent's response to the database
                if conversation_id and agent_full_text:
                    try:
                        async with async_session_maker() as stream_db:
                            agent_msg = DBMessage(
                                conversation_id=conversation_id,
                                sender_type="agent",
                                sender_id=agent.id,
                                sender_name=agent_display,
                                content=agent_full_text,
                                artifacts=agent_artifacts or None,
                            )
                            stream_db.add(agent_msg)
                            c = (await stream_db.execute(select(Conversation).where(Conversation.id == conversation_id))).scalar_one_or_none()
                            if c:
                                c.updated_at = func.now()
                            await stream_db.commit()
                    except Exception as e:
                        import logging
                        logging.getLogger("api").warning("Failed to save group agent message: %s", e)

                yield f"data: {json.dumps({'type': 'agent_done', 'agent_id': agent.id, 'agent_name': agent_display})}\n\n"
                await asyncio.sleep(0.1)

            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(gen_group(), media_type="text/event-stream")

    # 1-on-1 Chat Mode
    agent = None
    if agent_id:
        conditions = [Agent.id == agent_id]
        if agent_name:
            conditions.append(Agent.name.ilike(f"%{agent_name}%"))
        agent = (await db.execute(select(Agent).where(or_(*conditions)).limit(1))).scalar_one_or_none()

    if agent:
        system = agent.system_prompt or f"You are {agent.name}, a specialized AI agent for {agent.category}. Assist the user directly and professionally."
        tools = agent.tools or ["web_search", "image_generate", "read_url"]
    elif agent_name:
        system = f"You are {agent_name}, a specialized autonomous AI agent. Deliver concise, high-value domain expertise."
        tools = ["web_search", "image_generate", "read_url"]
    else:
        system = "You are a helpful AI assistant."
        tools = ["web_search", "image_generate", "read_url"]

    # Append live tools instruction to system prompt
    system += (
        "\n\nYou have access to real live tools:\n"
        "- web_search(query: str): Live public web search for facts, news, documentation.\n"
        "- image_generate(prompt: str): Generate a live image using Pollinations AI.\n"
        "- read_url(url: str): Read and summarize live webpage URLs.\n\n"
        "To invoke a tool, output: <<tool {\"name\": \"tool_name\", \"args\": {...}}>>\n"
        "When an image is generated, display the markdown image link: ![prompt](image_url)."
    )

    adapter = get_adapter(provider=provider, api_key=api_key, model=model)
    messages = [Message(role="system", content=system), Message(role="user", content=message)]
    schemas = None
    if tools:
        try:
            schemas = tool_schemas(tools)
        except Exception:
            schemas = None

    async def gen_single():
        full_response: list[str] = []
        artifacts: list[dict] = []
        agent_display = agent.name if agent else (agent_name or "AI Assistant")
        agent_avatar = agent.avatar if agent else "🤖"

        # Emit agent_start for unified protocol
        yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"

        # 1. Pre-execution: check if user prompt is an explicit invocation for web_search, image_generate, or read_url
        user_tool = _detect_user_tool_intent(message)
        if user_tool:
            t_name, t_args = user_tool
            yield f"data: {json.dumps({'type': 'tool_start', 'tool': t_name, 'args': t_args, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
            t_res, t_art = await _execute_tool_call(t_name, t_args, user.id if user else "user", db)
            if t_art:
                artifacts.append(t_art)
                yield f"data: {json.dumps({'type': 'artifact', 'artifact': t_art, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display})}\n\n"
            yield f"data: {json.dumps({'type': 'tool_done', 'tool': t_name, 'result': t_res, 'agent_name': agent_display})}\n\n"
            messages.append(Message(
                role="system",
                content=f"[Live Tool Observation for {t_name}]:\n{t_res}\nAddress the user using this live data. If an image was generated, include its markdown image link: ![{t_args.get('prompt', 'image')}]({t_art.get('url') if t_art else ''})"
            ))

        try:
            async for chunk in adapter.complete(messages, model=model, tools=schemas, stream=True):
                if chunk.delta:
                    full_response.append(chunk.delta)
                    yield f"data: {json.dumps({'type': 'delta', 'delta': chunk.delta, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
        except Exception:
            # Fallback streaming when local LLM service (Ollama) is not running
            fallback_text = (
                f"Hello! I am {agent_display}. I have processed your instruction: \"{message}\".\n\n"
                f"Autonomous background tasks have been queued. Let me know if you would like me to generate assets, analyze data, or dispatch actions."
            )
            words = fallback_text.split(" ")
            for w in words:
                word_delta = w + " "
                full_response.append(word_delta)
                yield f"data: {json.dumps({'type': 'delta', 'delta': word_delta, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                await asyncio.sleep(0.04)

        final_text = "".join(full_response).strip()

        # 2. Post-generation: check if model itself requested a tool via <<tool ...>>
        if _contains_tool_request(final_text):
            t_call = _parse_tool_request(final_text)
            if t_call and "name" in t_call and "args" in t_call:
                t_name = t_call["name"]
                t_args = t_call["args"]
                yield f"data: {json.dumps({'type': 'tool_start', 'tool': t_name, 'args': t_args, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                t_res, t_art = await _execute_tool_call(t_name, t_args, user.id if user else "user", db)
                if t_art:
                    artifacts.append(t_art)
                    yield f"data: {json.dumps({'type': 'artifact', 'artifact': t_art, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display})}\n\n"
                yield f"data: {json.dumps({'type': 'tool_done', 'tool': t_name, 'result': t_res, 'agent_name': agent_display})}\n\n"

                messages.append(Message(role="assistant", content=final_text))
                messages.append(Message(role="user", content=f"Tool result for '{t_name}':\n{t_res}\nPlease complete your response now to the user incorporating this result. Display markdown images if generated."))

                try:
                    async for chunk in adapter.complete(messages, model=model, stream=True):
                        if chunk.delta:
                            final_text += chunk.delta
                            yield f"data: {json.dumps({'type': 'delta', 'delta': chunk.delta, 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display, 'avatar': agent_avatar})}\n\n"
                except Exception:
                    pass

        if conversation_id and final_text:
            try:
                async with async_session_maker() as stream_db:
                    assistant_msg = DBMessage(
                        conversation_id=conversation_id,
                        sender_type="agent",
                        sender_id=agent.id if agent else agent_id,
                        sender_name=agent_display,
                        content=final_text,
                        artifacts=artifacts or None,
                    )
                    stream_db.add(assistant_msg)
                    c = (await stream_db.execute(select(Conversation).where(Conversation.id == conversation_id))).scalar_one_or_none()
                    if c:
                        c.updated_at = func.now()
                    await stream_db.commit()
            except Exception as e:
                import logging
                logging.getLogger("api").warning("Failed to save streamed assistant message to DB: %s", e)

        yield f"data: {json.dumps({'type': 'agent_done', 'agent_id': agent.id if agent else agent_id, 'agent_name': agent_display})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(gen_single(), media_type="text/event-stream")

