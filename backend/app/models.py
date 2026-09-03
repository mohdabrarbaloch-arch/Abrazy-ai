"""SQLAlchemy ORM models."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)  # For onboarding data, preferences, etc.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    agents: Mapped[list["Agent"]] = relationship(back_populates="owner")
    integrations: Mapped[list["Integration"]] = relationship(back_populates="user")
    api_keys: Mapped[list["ApiKey"]] = relationship(back_populates="user")


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    system_prompt: Mapped[str] = mapped_column(Text, default="")
    model: Mapped[str] = mapped_column(String(128), default="gemma3:4b")
    tools: Mapped[list] = mapped_column(JSON, default=list)  # list[str] tool names
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    avatar: Mapped[str] = mapped_column(String(10), default="🤖")  # emoji avatar
    category: Mapped[str] = mapped_column(String(64), default="General", index=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)  # list[str] tags for search
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, index=True)  # marketplace visibility
    is_official: Mapped[bool] = mapped_column(Boolean, default=False)  # official Abrazy agents
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped[User] = relationship(back_populates="agents")
    tasks: Mapped[list["Task"]] = relationship(back_populates="agent")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True)  # pending|running|success|failed
    input: Mapped[dict] = mapped_column(JSON, default=dict)
    output: Mapped[dict] = mapped_column(JSON, default=dict)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    trigger: Mapped[str] = mapped_column(String(32), default="manual")  # manual|cron|webhook
    cron: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    agent: Mapped[Agent | None] = relationship(back_populates="tasks")


class Integration(Base):
    __tablename__ = "integrations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(64), index=True)  # gmail|slack|notion|github
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending|active|error
    access_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    scopes: Mapped[list] = mapped_column(JSON, default=list)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="integrations")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    prefix: Mapped[str] = mapped_column(String(16), index=True)
    key_hash: Mapped[str] = mapped_column(String(64))
    label: Mapped[str] = mapped_column(String(128), default="")
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="api_keys")


class AgentTeam(Base):
    """Agent Teams - Collaboration rooms with multiple agents"""
    __tablename__ = "agent_teams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(64), default="General", index=True)
    agent_ids: Mapped[list] = mapped_column(JSON, default=list)  # list[str] agent IDs in team
    member_ids: Mapped[list] = mapped_column(JSON, default=list)  # list[str] user IDs (collaborators)
    tags: Mapped[list] = mapped_column(JSON, default=list)  # list[str] tags
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False)  # pre-built templates
    config: Mapped[dict] = mapped_column(JSON, default=dict)  # workflow config, payment settings
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped[User] = relationship("User", foreign_keys=[owner_id])


class AgentCategory(Base):
    """Categories for organizing agents"""
    __tablename__ = "agent_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(10), default="📁")  # emoji icon
    order: Mapped[int] = mapped_column(Integer, default=0)  # display order
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

