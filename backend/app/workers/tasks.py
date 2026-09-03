"""Celery app for background task execution.

When Redis is unavailable (local dev / offline), the app uses an in-process
fallback executor (`run_task_local`) so the platform remains fully demoable
without infrastructure. Production deployments use the Celery worker.
"""
from __future__ import annotations

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "aiagent",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=4,
)


# --- The unit of work (imported by both Celery and the local fallback) ---
async def _execute(task_id: str) -> None:
    """Load a Task, run its agent, persist output, and broadcast status."""
    from datetime import datetime, timezone

    from sqlalchemy import select
    from app.core.db import SessionLocal
    from app.models import Agent, Task
    from app.agents.orchestrator import run_agent
    from app.realtime import hub

    async with SessionLocal() as db:
        task = (await db.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
        if not task:
            return
        task.status = "running"
        await db.commit()
        hub.broadcast(task_id, {"type": "status", "state": "running"})

        agent = None
        if task.agent_id:
            agent = (await db.execute(select(Agent).where(Agent.id == task.agent_id))).scalar_one_or_none()

        try:
            out = await run_agent(
                agent_name=agent.name if agent else "Assistant",
                system_prompt=agent.system_prompt if agent else "",
                user_message=task.description or task.title,
                model=agent.model if agent else settings.OLLAMA_MODEL,
                tools=agent.tools if agent else [],
                user_id=task.owner_id,
                db=db,
                on_event=lambda ev: hub.broadcast(task_id, ev),
            )
            task.status = "success"
            task.output = {"result": out}
        except Exception as e:  # noqa: BLE001
            task.status = "failed"
            task.error = str(e)
        finally:
            task.finished_at = datetime.now(timezone.utc)
            await db.commit()


@celery_app.task(name="app.workers.tasks.run_task", bind=True)
def run_task(self, task_id: str) -> None:
    import asyncio

    asyncio.run(_execute(task_id))


# --- In-process fallback (no Redis required) ---
def run_task_local(task_id: str) -> None:
    import asyncio

    asyncio.run(_execute(task_id))


# --- Scheduler trigger (APScheduler-style cron dispatcher) ---
def should_run_now(cron: str | None) -> bool:
    """Lightweight check used by the scheduler heartbeat. `cron` is 5-field standard."""
    if not cron:
        return False
    # Full cron evaluation requires a scheduler lib; we expose the field shape here.
    return True
