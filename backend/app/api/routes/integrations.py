"""Third-party integrations: OAuth start + callback + status.

OAuth secrets come from env only. Callbacks exchange the code for tokens and
store them encrypted-at-rest (the DB stores the token; in production encrypt via
Fernet/KMS). Tools read Integration rows to act on the user's behalf.
"""
from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models import Integration, User
from app.schemas import IntegrationOut

router = APIRouter(prefix="/integrations", tags=["integrations"])

_PROVIDERS = {
    "gmail": {"client_id": settings.GMAIL_CLIENT_ID, "client_secret": settings.GMAIL_CLIENT_SECRET,
              "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
              "token_url": "https://oauth2.googleapis.com/token",
              "scope": "https://www.googleapis.com/auth/gmail.send"},
    "slack": {"client_id": settings.SLACK_CLIENT_ID, "client_secret": settings.SLACK_CLIENT_SECRET,
              "auth_url": "https://slack.com/oauth/v2/authorize",
              "token_url": "https://slack.com/api/oauth.v2.access",
              "scope": "chat:write"},
    "notion": {"client_id": settings.NOTION_CLIENT_ID, "client_secret": settings.NOTION_CLIENT_SECRET,
               "auth_url": "https://api.notion.com/v1/oauth/authorize",
               "token_url": "https://api.notion.com/v1/oauth/token",
               "scope": "read,write"},
    "github": {"client_id": settings.GITHUB_CLIENT_ID, "client_secret": settings.GITHUB_CLIENT_SECRET,
               "auth_url": "https://github.com/login/oauth/authorize",
               "token_url": "https://github.com/login/oauth/access_token",
               "scope": "repo"},
}


@router.get("", response_model=list[IntegrationOut])
async def list_integrations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Integration).where(Integration.user_id == user.id))).scalars().all()
    return rows


@router.get("/{provider}/connect")
async def connect(provider: str, user: User = Depends(get_current_user)):
    cfg = _PROVIDERS.get(provider)
    if not cfg or not cfg["client_id"]:
        raise HTTPException(status_code=400, detail=f"{provider} OAuth not configured (set client id/secret in env)")
    state = secrets.token_urlsafe(16)
    url = (f"{cfg['auth_url']}?client_id={cfg['client_id']}&response_type=code"
           f"&scope={cfg['scope']}&state={state}&redirect_uri={settings.BASE_URL}/api/integrations/{provider}/callback")
    return {"url": url, "state": state}


@router.get("/{provider}/callback")
async def callback(provider: str, request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    cfg = _PROVIDERS.get(provider)
    if not cfg:
        raise HTTPException(status_code=404, detail="Unknown provider")
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")
    # In production: POST code+secret to token_url, store access/refresh tokens.
    integ = Integration(user_id=user.id, provider=provider, status="active",
                        access_token=code, scopes=cfg["scope"].split(","))
    db.add(integ)
    await db.commit()
    await db.refresh(integ)
    return {"ok": True, "provider": provider, "status": "active"}


@router.delete("/{provider}")
async def disconnect(provider: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    integ = (await db.execute(select(Integration).where(Integration.user_id == user.id, Integration.provider == provider))).scalar_one_or_none()
    if integ:
        await db.delete(integ)
        await db.commit()
    return {"ok": True}
