"""Application configuration loaded from environment variables (pydantic v2).

All secrets live in the environment only (never hardcoded). A .env file is
supported via python-dotenv for local development. Settings is instantiable so
it can be used in tests with overrides.
"""
from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Core ---
    APP_NAME: str = "AI Agent Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # --- Security ---
    SECRET_KEY: str = "change-me-in-production-please"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # --- Database ---
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/aiagent"

    # --- Redis / Queue ---
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # --- Rate limiting ---
    RATE_LIMIT_PER_MINUTE: int = 60

    # --- LLM providers (Ollama is default / local, no key required) ---
    LLM_PROVIDER: str = "ollama"  # ollama | openai | anthropic
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "gemma3:4b"
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str | None = None
    ANTHROPIC_MODEL: str = "claude-3-5-haiku-latest"

    # --- Integrations (OAuth secrets, env only) ---
    GMAIL_CLIENT_ID: str | None = None
    GMAIL_CLIENT_SECRET: str | None = None
    SLACK_CLIENT_ID: str | None = None
    SLACK_CLIENT_SECRET: str | None = None
    NOTION_CLIENT_ID: str | None = None
    NOTION_CLIENT_SECRET: str | None = None
    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None
    
    # --- OAuth Authentication Providers ---
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    MICROSOFT_CLIENT_ID: str | None = None
    MICROSOFT_CLIENT_SECRET: str | None = None
    BACKEND_URL: str = "http://localhost:8000"

    # --- Billing ---
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None
    BILLING_ENABLED: bool = False

    # --- CORS ---
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- Misc ---
    LOG_LEVEL: str = "INFO"

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            APP_NAME=os.getenv("APP_NAME", "AI Agent Platform"),
            ENVIRONMENT=os.getenv("ENVIRONMENT", "development"),
            DEBUG=os.getenv("DEBUG", "false").lower() in {"1", "true", "yes", "on"},
            SECRET_KEY=os.getenv("SECRET_KEY", "change-me-in-production-please"),
            LLM_PROVIDER=os.getenv("LLM_PROVIDER", "ollama"),
            CORS_ORIGINS=[o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()],
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
