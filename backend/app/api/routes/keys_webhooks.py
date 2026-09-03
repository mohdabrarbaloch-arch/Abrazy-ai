"""API key management + inbound webhook receiver."""
from __future__ import annotations

import time

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.core.security import generate_api_key, hash_api_key
from app.models import ApiKey, Integration, Task, User
from app.schemas import ApiKeyCreate, ApiKeyCreated, ApiKeyOut
from app.workers import tasks as worker_tasks

router = APIRouter(tags=["keys-webhooks"])


# --- API keys ---
@router.get("/api-keys", response_model=list[ApiKeyOut])
async def list_keys(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(ApiKey).where(ApiKey.user_id == user.id))).scalars().all()
    return rows


@router.post("/api-keys", response_model=ApiKeyCreated, status_code=201)
async def create_key(body: ApiKeyCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    prefix, full = generate_api_key()
    key = ApiKey(user_id=user.id, prefix=prefix, key_hash=hash_api_key(full), label=body.label)
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return ApiKeyCreated(id=key.id, prefix=prefix, label=key.label, key=full, created_at=key.created_at)


@router.delete("/api-keys/{key_id}")
async def delete_key(key_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    key = (await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user.id))).scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    await db.delete(key)
    await db.commit()
    return {"ok": True}


# --- Inbound webhook: triggers a task when a connected service posts to it ---
@router.post("/webhooks/{provider}")
async def inbound_webhook(provider: str, request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    integ = (await db.execute(select(Integration).where(Integration.provider == provider, Integration.status == "active"))).scalars().first()
    if not integ:
        raise HTTPException(status_code=404, detail="No active integration for provider")
    task = Task(owner_id=integ.user_id, title=f"Webhook: {provider}", trigger="webhook",
                description=f"Received webhook from {provider}", input=payload)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    # enqueue (local fallback or redis)
    try:
        import redis

        redis.from_url(__import__("app.core.config", fromlist=["settings"]).settings.REDIS_URL).ping()
        worker_tasks.run_task.delay(task.id)
    except Exception:
        import threading

        threading.Thread(target=worker_tasks.run_task_local, args=(task.id,), daemon=True).start()
    return {"ok": True, "task_id": task.id}
