"""Auth dependencies + rate limiting middleware."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import decode_token
from app.core.config import settings
from app.models import User

bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if creds is None:
        # Allow API-key auth via header "X-API-Key"
        api_key = request.headers.get("X-API-Key")
        if api_key:
            from app.models import ApiKey
            from app.core.security import verify_api_key

            rows = (await db.execute(select(ApiKey))).scalars().all()
            for k in rows:
                if verify_api_key(api_key, k.key_hash):
                    user = (await db.execute(select(User).where(User.id == k.user_id))).scalar_one_or_none()
                    if user:
                        k.last_used_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                        await db.commit()
                        return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong token type")
    user = (await db.execute(select(User).where(User.id == payload["sub"]))).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive")
    return user


# --- Simple in-memory rate limiter (swap for redis in prod) ---
class RateLimiter:
    def __init__(self, per_minute: int) -> None:
        self.per_minute = per_minute
        self.hits: dict[str, deque] = defaultdict(deque)

    async def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "anon"
        now = time.time()
        window = self.hits[ip]
        while window and window[0] < now - 60:
            window.popleft()
        if len(window) >= self.per_minute:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        window.append(now)


rate_limiter = RateLimiter(settings.RATE_LIMIT_PER_MINUTE)
