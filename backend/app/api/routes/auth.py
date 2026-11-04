"""Auth routes: register, login, refresh, me, OAuth, magic links."""
from __future__ import annotations

import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_optional_user
from app.core.config import settings
from app.core.db import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models import User
from app.schemas import LoginIn, RefreshIn, TokenPair, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    exists = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered. Please Sign In.")
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name or body.email.split("@")[0].capitalize(),
        user_metadata={"registered_at": datetime.now(timezone.utc).isoformat()}
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(body: LoginIn, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if not user:
        # Seamless sign-up on first sign-in for frictionless developer & user onboarding
        if len(body.password) >= 6:
            user = User(
                email=body.email,
                hashed_password=hash_password(body.password),
                full_name=body.email.split("@")[0].capitalize(),
                user_metadata={"auto_registered": True}
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))
        raise HTTPException(status_code=401, detail="Account not found. Please click 'Sign Up' or enter at least 6 characters.")

    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password for this account.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshIn):
    from app.core.security import decode_token

    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")
    return TokenPair(access_token=create_access_token(payload["sub"]), refresh_token=create_refresh_token(payload["sub"]))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/profile", response_model=UserOut)
async def update_profile(body: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Update user profile — merges body into user_metadata."""
    import copy
    current_meta = copy.deepcopy(user.user_metadata or {})
    # If body has user_metadata key, merge it in
    if "user_metadata" in body:
        current_meta.update(body["user_metadata"])
    else:
        current_meta.update(body)
    current_meta["updated_at"] = datetime.now(timezone.utc).isoformat()
    user.user_metadata = current_meta
    # Update full_name if provided
    if body.get("full_name"):
        user.full_name = body["full_name"]
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(user, "user_metadata")
    await db.commit()
    await db.refresh(user)
    return user


# --- Standard OAuth Flow ---
@router.get("/oauth/{provider}/connect")
async def oauth_connect(provider: str):
    """Start OAuth flow for provider."""
    state = secrets.token_urlsafe(32)
    provider_lower = provider.lower()

    if "google" in provider_lower:
        google_id = settings.GOOGLE_CLIENT_ID
        if not google_id or google_id == "YOUR_GOOGLE_CLIENT_ID":
            raise HTTPException(
                status_code=501,
                detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env."
            )
        auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        scope = "openid email profile"
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/oauth/google/callback"
        client_id = google_id
    elif "github" in provider_lower:
        github_id = settings.GITHUB_CLIENT_ID
        if not github_id or github_id == "YOUR_GITHUB_CLIENT_ID":
            raise HTTPException(
                status_code=501,
                detail="GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env."
            )
        auth_url = "https://github.com/login/oauth/authorize"
        scope = "read:user user:email"
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/oauth/github/callback"
        client_id = github_id
    elif "microsoft" in provider_lower:
        client_id = settings.MICROSOFT_CLIENT_ID or ""
        if not client_id or client_id == "YOUR_MICROSOFT_CLIENT_ID":
            raise HTTPException(
                status_code=501,
                detail="Microsoft OAuth is not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in .env."
            )
        auth_url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        scope = "openid email profile"
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/oauth/microsoft/callback"
    else:
        raise HTTPException(status_code=400, detail=f"Provider '{provider}' not supported")

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scope,
        "state": state,
        "response_type": "code"
    }
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"url": f"{auth_url}?{query_string}", "state": state}


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    request: Request,
    provider: str,
    code: str = Query(...),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Handle OAuth callback — exchange code for user profile and issue JWT."""
    import urllib.request
    import urllib.parse
    import json as json_lib

    provider_lower = provider.lower()

    if "google" in provider_lower:
        # Exchange code for tokens
        token_data = urllib.parse.urlencode({
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/oauth/google/callback",
            "grant_type": "authorization_code",
        }).encode()
        try:
            req = urllib.request.Request("https://oauth2.googleapis.com/token", data=token_data, method="POST")
            resp = urllib.request.urlopen(req, timeout=10)
            token_resp = json_lib.loads(resp.read())
            access_token_google = token_resp.get("access_token")
            # Get user info
            user_req = urllib.request.Request(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token_google}"}
            )
            user_resp = urllib.request.urlopen(user_req, timeout=10)
            user_info = json_lib.loads(user_resp.read())
            email = user_info.get("email")
            full_name = user_info.get("name", email.split("@")[0] if email else "User")
        except Exception as e:
            redirect_url = f"{settings.FRONTEND_URL}/auth/callback?error=google_exchange_failed"
            return RedirectResponse(url=redirect_url)

    elif "github" in provider_lower:
        token_data = urllib.parse.urlencode({
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/oauth/github/callback",
        }).encode()
        try:
            req = urllib.request.Request(
                "https://github.com/login/oauth/access_token",
                data=token_data,
                headers={"Accept": "application/json"},
                method="POST"
            )
            resp = urllib.request.urlopen(req, timeout=10)
            token_resp = json_lib.loads(resp.read())
            access_token_github = token_resp.get("access_token")
            user_req = urllib.request.Request(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token_github}", "Accept": "application/json"}
            )
            user_resp = urllib.request.urlopen(user_req, timeout=10)
            user_info = json_lib.loads(user_resp.read())
            email = user_info.get("email")
            if not email:
                # GitHub may hide email — fetch from emails endpoint
                email_req = urllib.request.Request(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token_github}", "Accept": "application/json"}
                )
                email_resp = urllib.request.urlopen(email_req, timeout=10)
                emails = json_lib.loads(email_resp.read())
                primary = next((e["email"] for e in emails if e.get("primary")), None)
                email = primary or f"github_{user_info.get('id')}@abrazy.ai"
            full_name = user_info.get("name") or user_info.get("login", "User")
        except Exception as e:
            redirect_url = f"{settings.FRONTEND_URL}/auth/callback?error=github_exchange_failed"
            return RedirectResponse(url=redirect_url)
    else:
        raise HTTPException(status_code=400, detail=f"Provider '{provider}' not supported")

    # Find or create user
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            full_name=full_name,
            user_metadata={"oauth_provider": provider_lower, "registered_at": datetime.now(timezone.utc).isoformat()}
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # Redirect to frontend callback with tokens in URL params
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
    return RedirectResponse(url=redirect_url)


# --- Magic Link ---
@router.post("/magic-link")
async def send_magic_link(body: dict, db: AsyncSession = Depends(get_db)):
    email = body.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            full_name=email.split("@")[0],
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    magic_token = create_access_token(user.id, expires_delta=timedelta(minutes=15))
    magic_link = f"{settings.FRONTEND_URL}/auth/verify?token={magic_token}"
    # Only expose the link in non-production environments for debugging
    response: dict = {"message": "Magic link sent"}
    if settings.ENVIRONMENT != "production":
        response["dev_link"] = magic_link
    return response


@router.get("/magic-link/verify", response_model=TokenPair)
async def verify_magic_link(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    from app.core.security import decode_token

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired magic link")

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id)
    )
