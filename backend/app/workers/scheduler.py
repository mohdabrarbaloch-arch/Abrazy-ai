"""Background scheduler heartbeat (APScheduler) that fires cron-triggered tasks.

Runs inside the API process when SCHEDULER_ENABLED=true. In production you may
run this as a dedicated process. Each Agent/Task with a `cron` field is evaluated
on the minute; due tasks are enqueued to the task runner.
"""
from __future__ import annotations

import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.config import settings

log = logging.getLogger("scheduler")


def _dispatch(task_id: str) -> None:
    if _redis_available():
        from app.workers.tasks import run_task

        run_task.delay(task_id)
    else:
        from app.workers.tasks import run_task_local

        import threading

        threading.Thread(target=run_task_local, args=(task_id,), daemon=True).start()


def _redis_available() -> bool:
    try:
        import redis

        r = redis.from_url(settings.REDIS_URL)
        return bool(r.ping())
    except Exception:
        return False


async def load_and_schedule() -> None:
    """Scan DB for cron tasks and register them with APScheduler."""
    from sqlalchemy import select
    from app.core.db import SessionLocal
    from app.models import Task

    scheduler = AsyncIOScheduler()
    async with SessionLocal() as db:
        rows = (await db.execute(select(Task).where(Task.trigger == "cron", Task.cron.isnot(None)))).scalars().all()
        for t in rows:
            try:
                scheduler.add_job(lambda tid=t.id: _dispatch(tid), CronTrigger.from_crontab(t.cron))
                log.info("scheduled task %s @ %s", t.id, t.cron)
            except Exception as e:  # noqa: BLE001
                log.warning("bad cron for %s: %s", t.id, e)
    scheduler.start()


def now() -> str:
    return datetime.utcnow().isoformat()
