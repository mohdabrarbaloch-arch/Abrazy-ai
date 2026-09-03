"""Auth routes: register, login, refresh, me, OAuth, magic links."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models import User
from app.schemas import LoginIn, RefreshIn, TokenPair, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    exists = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(body: LoginIn, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
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
    """Update user profile with onboarding data"""
    # Store onboarding preferences in user metadata
    if not user.metadata:
        user.metadata = {}
    
    user.metadata.update({
        "role": body.get("role"),
        "use_case": body.get("useCase"),
        "team_size": body.get("teamSize"),
        "interests": body.get("interests", []),
        "onboarded": True,
        "onboarded_at": datetime.utcnow().isoformat()
    })
    
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/magic-link")
async def send_magic_link(body: dict, db: AsyncSession = Depends(get_db)):
    """Send magic link for passwordless login"""
    email = body.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    # Find or create user
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        # Auto-create user for magic link (like Teamily does)
        user = User(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),  # Random password
            full_name=email.split("@")[0],
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Generate magic link token (expires in 15 minutes)
    magic_token = create_access_token(user.id, expires_delta=timedelta(minutes=15))
    
    # In production, send email here
    # For development, log the link
    magic_link = f"http://localhost:3000/auth/verify?token={magic_token}"
    print(f"\n🔗 Magic Link for {email}:")
    print(f"   {magic_link}\n")
    
    return {"message": "Magic link sent", "dev_link": magic_link}


@router.get("/magic-link/verify", response_model=TokenPair)
async def verify_magic_link(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Verify magic link token and return auth tokens"""
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


@router.get("/oauth/{provider}/connect")
async def oauth_connect(provider: str, user: Optional[User] = Depends(get_current_user)):
    """Start OAuth flow for provider"""
    from app.core.config import settings
    
    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # OAuth URLs for different providers
    oauth_configs = {
        "google": {
            "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "client_id": settings.GOOGLE_CLIENT_ID or "YOUR_GOOGLE_CLIENT_ID",
            "scope": "openid email profile",
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/oauth/google/callback"
        },
        "github": {
            "auth_url": "https://github.com/login/oauth/authorize",
            "client_id": settings.GITHUB_CLIENT_ID or "YOUR_GITHUB_CLIENT_ID",
            "scope": "read:user user:email",
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/oauth/github/callback"
        },
        "microsoft": {
            "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            "client_id": settings.MICROSOFT_CLIENT_ID or "YOUR_MICROSOFT_CLIENT_ID",
            "scope": "openid email profile",
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/oauth/microsoft/callback"
        }
    }
    
    if provider not in oauth_configs:
        raise HTTPException(status_code=400, detail=f"Provider '{provider}' not supported")
    
    config = oauth_configs[provider]
    
    # Build OAuth URL
    params = {
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "scope": config["scope"],
        "state": state,
        "response_type": "code"
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    oauth_url = f"{config['auth_url']}?{query_string}"
    
    return {"url": oauth_url, "state": state}


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str = Query(...),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Handle OAuth callback and create/login user"""
    # In production, verify state token for CSRF protection
    
    # Exchange code for access token (simplified - implement full OAuth flow)
    # This is a placeholder - you need to implement actual OAuth token exchange
    
    # For demo purposes, create a mock user from OAuth
    # In production, fetch user info from OAuth provider
    
    email = f"oauth_{provider}_{code[:8]}@example.com"
    
    # Find or create user
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            full_name=f"{provider.title()} User",
            metadata={"oauth_provider": provider}
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Return tokens
    tokens = TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id)
    )
    
    # Redirect to frontend with tokens
    from fastapi.responses import RedirectResponse
    frontend_url = "http://localhost:3000"
    return RedirectResponse(
        url=f"{frontend_url}/auth/callback?provider={provider}&code={code}&access_token={tokens.access_token}"
    )
