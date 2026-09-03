"""Agent orchestrator: reasoning + tool-calling loop.

Drives a single agent run:
  1. Build system + user messages.
  2. Call the LLM (streaming) with the agent's allowed tool schemas.
  3. If the model emits a tool call, execute the registered tool, feed the
     result back, and continue until the model finishes.
  4. Yield status events so the WebSocket layer can push live updates.

The loop is bounded (max_tool_rounds) to prevent runaway execution.
"""
from __future__ import annotations

import json
from typing import AsyncIterator, Callable

from app.agents.llm import CompletionChunk, Message, get_adapter
from app.agents.tools import get_tool, tool_schemas
from app.core.config import settings

StatusEvent = dict  # {"type": "status"|"token"|"tool"|"done"|"error", ...}


async def run_agent(
    *,
    agent_name: str,
    system_prompt: str,
    user_message: str,
    model: str,
    tools: list[str],
    user_id: str,
    db=None,
    provider: str | None = None,
    on_event: Callable[[StatusEvent], None] | None = None,
    max_tool_rounds: int = 5,
) -> str:
    adapter = get_adapter(provider)
    messages: list[Message] = [
        Message(role="system", content=system_prompt or "You are a helpful AI agent."),
        Message(role="user", content=user_message),
    ]
    schemas = tool_schemas(tools) if tools else None
    final_text = ""

    def emit(ev: StatusEvent) -> None:
        if on_event:
            on_event(ev)

    emit({"type": "status", "state": "planning", "message": f"{agent_name} is thinking..."})

    for _ in range(max_tool_rounds + 1):
        buf = ""
        async for chunk in adapter.complete(messages, model=model, tools=schemas, stream=True):
            if chunk.delta:
                buf += chunk.delta
                final_text = buf  # last text wins
                emit({"type": "token", "delta": chunk.delta})
        # Tool calling is handled via a structured marker when tools are enabled.
        # Ollama returns tool calls inside message; we keep it simple & robust:
        # detect an explicit function_call request in the produced text.
        if schemas and _contains_tool_request(buf):
            call = _parse_tool_request(buf)
            if call:
                emit({"type": "tool", "name": call["name"], "args": call["args"]})
                tool = get_tool(call["name"])
                if not tool:
                    result = json.dumps({"error": f"unknown tool {call['name']}"})
                else:
                    result = await tool.run(call["args"], user_id=user_id, db=db)
                emit({"type": "tool_result", "name": call["name"], "result": result})
                messages.append(Message(role="user", content=f"Tool {call['name']} returned: {result}"))
                continue
        emit({"type": "done", "message": final_text})
        return final_text

    emit({"type": "done", "message": final_text})
    return final_text


def _contains_tool_request(text: str) -> bool:
    return "<<tool" in text and ">>" in text


def _parse_tool_request(text: str) -> dict | None:
    try:
        start = text.index("<<tool") + 6
        end = text.index(">>", start)
        payload = text[start:end].strip()
        return json.loads(payload)
    except (ValueError, json.JSONDecodeError):
        return None
