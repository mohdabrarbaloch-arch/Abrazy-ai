"""Pydantic v2 schemas for API request/response validation."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = ""


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


# --- Agent ---
class AgentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    system_prompt: str = ""
    model: str = "gemma3:4b"
    tools: list[str] = Field(default_factory=list)
    config: dict = Field(default_factory=dict)
    avatar: str = "🤖"
    category: str = "General"
    tags: list[str] = Field(default_factory=list)
    is_public: bool = False


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    system_prompt: str | None = None
    model: str | None = None
    tools: list[str] | None = None
    config: dict | None = None
    avatar: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_public: bool | None = None


class AgentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    owner_id: str
    name: str
    description: str
    system_prompt: str
    model: str
    tools: list
    config: dict
    avatar: str
    category: str
    tags: list
    is_public: bool
    is_official: bool
    created_at: datetime


# --- Task ---
class TaskCreate(BaseModel):
    agent_id: str | None = None
    title: str = Field(min_length=1)
    description: str = ""
    input: dict = Field(default_factory=dict)
    trigger: str = "manual"
    cron: str | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    owner_id: str
    agent_id: str | None
    title: str
    description: str
    status: str
    input: dict
    output: dict
    error: str | None
    trigger: str
    cron: str | None
    created_at: datetime
    finished_at: datetime | None


# --- Integration ---
class IntegrationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    provider: str
    status: str
    scopes: list
    created_at: datetime


# --- API key ---
class ApiKeyCreate(BaseModel):
    label: str = ""


class ApiKeyOut(BaseModel):
    id: str
    prefix: str
    label: str
    created_at: datetime


class ApiKeyCreated(BaseModel):
    id: str
    prefix: str
    label: str
    key: str  # full key, shown only once
    created_at: datetime
