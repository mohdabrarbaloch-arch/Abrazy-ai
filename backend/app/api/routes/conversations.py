"""Conversations and Messages API routes for Abrazy.ai."""
from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_optional_user
from app.core.db import get_db
from app.models import Agent, Conversation, Message, User
from app.schemas import (
    ConversationCreate,
    ConversationOut,
    ConversationUpdate,
    MessageCreate,
    MessageOut,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversations", tags=["conversations"])


async def _enrich_conversation(conv: Conversation, db: AsyncSession) -> dict[str, Any]:
    """Helper to enrich conversation with agent avatar/name and last message."""
    agent_avatar = "🤖"
    agent_name = None

    if conv.agent:
        agent_avatar = conv.agent.avatar or "🤖"
        agent_name = conv.agent.name
    elif conv.agent_id:
        agent = (await db.execute(select(Agent).where(Agent.id == conv.agent_id))).scalar_one_or_none()
        if agent:
            agent_avatar = agent.avatar or "🤖"
            agent_name = agent.name
    elif conv.is_group:
        agent_avatar = "👥"
        agent_name = "Agent Squad"

    # Get the latest message
    latest_msg = (
        await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    last_msg_out = MessageOut.model_validate(latest_msg) if latest_msg else None

    return {
        "id": conv.id,
        "user_id": conv.user_id,
        "title": conv.title,
        "is_group": conv.is_group,
        "agent_id": conv.agent_id,
        "member_agent_ids": conv.member_agent_ids or [],
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "last_message": last_msg_out,
        "agent_avatar": agent_avatar,
        "agent_name": agent_name,
    }


@router.get("", response_model=list[ConversationOut])
async def list_conversations(
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, le=100),
):
    """List conversations for user or guest. Auto-seeds default conversations from existing agents if empty."""
    query = select(Conversation).options(selectinload(Conversation.agent))

    if user:
        query = query.where(or_(Conversation.user_id == user.id, Conversation.user_id.is_(None)))
    
    limit_val = limit if isinstance(limit, int) else 50
    query = query.order_by(Conversation.updated_at.desc()).limit(limit_val)
    rows = (await db.execute(query)).scalars().all()

    # If no conversations exist yet, auto-seed default conversations from available agents
    if not rows:
        agent_query = select(Agent).order_by(Agent.is_official.desc(), Agent.created_at.desc()).limit(8)
        agents = (await db.execute(agent_query)).scalars().all()

        if agents:
            user_id = user.id if user else None
            for agent in agents:
                conv = Conversation(
                    user_id=user_id,
                    title=agent.name,
                    is_group=False,
                    agent_id=agent.id,
                )
                db.add(conv)
                await db.flush()

                welcome_msg = Message(
                    conversation_id=conv.id,
                    sender_type="agent",
                    sender_id=agent.id,
                    sender_name=agent.name,
                    content=f"Hello! I am {agent.name}. How can I assist you with your project or workflow today?",
                )
                db.add(welcome_msg)

            await db.commit()

            # Re-fetch populated conversations
            re_query = select(Conversation).options(selectinload(Conversation.agent))
            if user:
                re_query = re_query.where(or_(Conversation.user_id == user.id, Conversation.user_id.is_(None)))
            re_query = re_query.order_by(Conversation.updated_at.desc()).limit(limit_val)
            rows = (await db.execute(re_query)).scalars().all()

    enriched = [await _enrich_conversation(c, db) for c in rows]
    return enriched


@router.post("", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    body: ConversationCreate,
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new 1-on-1 or multi-agent group conversation."""
    user_id = user.id if user else None
    title = body.title

    # If 1-on-1 and title is default, use agent's name
    if not body.is_group and body.agent_id:
        agent = (await db.execute(select(Agent).where(Agent.id == body.agent_id))).scalar_one_or_none()
        if agent and (title == "New Chat" or not title):
            title = agent.name

    conv = Conversation(
        user_id=user_id,
        title=title,
        is_group=body.is_group,
        agent_id=body.agent_id,
        member_agent_ids=body.member_agent_ids,
    )
    db.add(conv)
    await db.flush()

    # Add welcome message
    if body.is_group:
        welcome_content = f"Group '{title}' created with {len(body.member_agent_ids)} agents ready to collaborate!"
        msg = Message(
            conversation_id=conv.id,
            sender_type="system",
            sender_id="system",
            sender_name="System",
            content=welcome_content,
        )
        db.add(msg)
    elif body.agent_id:
        agent = (await db.execute(select(Agent).where(Agent.id == body.agent_id))).scalar_one_or_none()
        agent_name = agent.name if agent else "AI Agent"
        msg = Message(
            conversation_id=conv.id,
            sender_type="agent",
            sender_id=body.agent_id,
            sender_name=agent_name,
            content=f"Hello! I am {agent_name}. How can I assist you with your project today?",
        )
        db.add(msg)

    await db.commit()
    await db.refresh(conv)

    enriched = await _enrich_conversation(conv, db)
    return enriched


@router.get("/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get conversation details by ID."""
    conv = (
        await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.agent))
            .where(Conversation.id == conversation_id)
        )
    ).scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return await _enrich_conversation(conv, db)


@router.patch("/{conversation_id}", response_model=ConversationOut)
async def update_conversation(
    conversation_id: str,
    body: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update conversation title or member agents."""
    conv = (
        await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.agent))
            .where(Conversation.id == conversation_id)
        )
    ).scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if body.title is not None:
        conv.title = body.title
    if body.member_agent_ids is not None:
        conv.member_agent_ids = body.member_agent_ids

    await db.commit()
    await db.refresh(conv)

    return await _enrich_conversation(conv, db)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation and its messages."""
    conv = (
        await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    ).scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conv)
    await db.commit()
    return None


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def list_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=100, le=500),
):
    """Fetch message history for a conversation."""
    limit_val = limit if isinstance(limit, int) else 100
    query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit_val)
    )
    rows = (await db.execute(query)).scalars().all()
    return rows


@router.post("/{conversation_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def create_message(
    conversation_id: str,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a message to a conversation."""
    conv = (
        await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    ).scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg = Message(
        conversation_id=conversation_id,
        sender_type=body.sender_type,
        sender_id=body.sender_id,
        sender_name=body.sender_name,
        content=body.content,
        artifacts=body.artifacts,
    )
    db.add(msg)

    # Touch updated_at on conversation
    conv.updated_at = func.now()

    await db.commit()
    await db.refresh(msg)
    return msg
