"""Unit tests: schemas validation + config + rate limiter."""
import asyncio

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.api.deps import RateLimiter
from app.schemas import AgentCreate, LoginIn, UserCreate


def test_user_create_requires_valid_email():
    with pytest.raises(ValidationError):
        UserCreate(email="not-an-email", password="longenough1")


def test_user_create_requires_long_password():
    with pytest.raises(ValidationError):
        UserCreate(email="a@b.com", password="short")


def test_agent_create_defaults():
    a = AgentCreate(name="Researcher")
    assert a.model == "gemma3:4b"
    assert a.tools == []


def test_login_schema():
    l = LoginIn(email="a@b.com", password="secret123")
    assert l.email == "a@b.com"


def test_settings_cors_parsing():
    s = Settings(CORS_ORIGINS=["http://a.com", "http://b.com"])
    assert s.CORS_ORIGINS == ["http://a.com", "http://b.com"]


def test_rate_limiter_blocks_after_limit():
    rl = RateLimiter(per_minute=3)
    from fastapi import Request

    class FakeClient:
        host = "1.2.3.4"

    class FakeReq:
        client = FakeClient()
        url = type("u", (), {"path": "/api/x"})()

    req = FakeReq()
    for _ in range(3):
        asyncio.run(rl(req))
    with pytest.raises(Exception):
        asyncio.run(rl(req))
