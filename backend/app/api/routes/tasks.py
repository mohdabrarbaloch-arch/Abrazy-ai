"""Task routes: create + enqueue, list, get, plus the chat-completion endpoint."""
from __future__ import annotations

import asyncio
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.core.security import create_access_token
from app.models import Agent, Task, User
from app.schemas import TaskCreate, TaskOut
from app.agents.llm import Message, get_adapter
from app.workers import tasks as worker_tasks

router = APIRouter(prefix="/tasks", tags=["tasks"])


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


# --- Chat: talk to an agent (SSE streaming) ---
@router.post("/chat/stream")
async def chat_stream(body: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent_id = body.get("agent_id")
    message = body.get("message", "")
    model = body.get("model", "gemma3:4b")
    agent = None
    if agent_id:
        agent = (await db.execute(select(Agent).where(Agent.id == agent_id, Agent.owner_id == user.id))).scalar_one_or_none()
    system = agent.system_prompt if agent else "You are a helpful AI assistant."
    tools = agent.tools if agent else []

    adapter = get_adapter()
    messages = [Message(role="system", content=system), Message(role="user", content=message)]
    schemas = None
    if tools:
        from app.agents.tools import tool_schemas

        schemas = tool_schemas(tools)

    async def gen():
        async for chunk in adapter.complete(messages, model=model, tools=schemas, stream=True):
            if chunk.delta:
                yield f"data: {json.dumps({'delta': chunk.delta})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
