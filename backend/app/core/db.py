"""Database session management (SQLAlchemy 2.0 async)."""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


# Build engine kwargs — Neon (and any SSL Postgres) needs connect_args with ssl
_engine_kwargs: dict = {
    "echo": settings.DEBUG,
    "pool_pre_ping": True,
}

_db_url = settings.DATABASE_URL
if _db_url.startswith("postgresql"):
    # Enable SSL for cloud databases (Neon, Supabase, etc.)
    _engine_kwargs["connect_args"] = {"ssl": "require"}
    # Use connection pooling-friendly settings for Neon's pooler
    _engine_kwargs["pool_size"] = 5
    _engine_kwargs["max_overflow"] = 10
    _engine_kwargs["pool_recycle"] = 300  # recycle connections every 5 min

engine = create_async_engine(_db_url, **_engine_kwargs)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
async_session_maker = SessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session

get_session = get_db


async def init_db() -> None:
    """Create tables. In production prefer Alembic migrations."""
    # Import models so they register on Base.metadata
    from app import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
