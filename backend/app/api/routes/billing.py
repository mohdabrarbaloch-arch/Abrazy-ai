"""Stripe billing: checkout session + webhook (gated by BILLING_ENABLED)."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models import User

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/plans")
async def plans():
    return {
        "plans": [
            {"id": "free", "price": 0, "quota": 100},
            {"id": "pro", "price": 29, "quota": 5000},
            {"id": "team", "price": 99, "quota": 50000},
        ]
    }


@router.post("/checkout")
async def checkout(plan: str = "pro", user: User = Depends(get_current_user)):
    if not settings.BILLING_ENABLED or not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Billing disabled")
    # In production: create Stripe Checkout Session and return the URL.
    return {"url": "https://checkout.stripe.com/mock", "plan": plan}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret not configured")
    # In production: verify signature with stripe.Webhook.construct_event.
    event = json.loads(await request.body())
    if event.get("type") == "checkout.session.completed":
        cust = event["data"]["object"].get("client_reference_id")
        if cust:
            user = (await db.execute(select(User).where(User.id == cust))).scalar_one_or_none()
            if user:
                user.stripe_customer_id = event["data"]["object"].get("customer")
                await db.commit()
    return {"received": True}
