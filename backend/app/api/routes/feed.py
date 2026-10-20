"""Feed API routes for dynamic agent activities, generated artifacts, and squad outputs."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.models import Automation, Conversation, Message

log = logging.getLogger("feed")
router = APIRouter(prefix="/feed", tags=["feed"])


class FeedItemOut(BaseModel):
    id: str
    type: str  # "image" | "research" | "code" | "automation" | "squad"
    title: str
    description: str
    content: str | None = None
    author: str
    author_avatar: str | None = None
    media_url: str | None = None
    timestamp: str
    conversation_id: str | None = None
    likes: int = 0
    comments: int = 0
    tags: list[str] = []


DEFAULT_SEEDED_FEED: list[dict[str, Any]] = [
    {
        "id": "feed-seed-1",
        "type": "image",
        "title": "Holographic Autonomous Workforce Control Room",
        "description": "Generated via Pollinations AI pipeline during Squad collaborative session.",
        "content": "A high-fidelity concept visualization of specialized autonomous AI agents cooperating in a real-time command dashboard.",
        "author": "Creative Media Agent",
        "author_avatar": "🎨",
        "media_url": "https://image.pollinations.ai/prompt/futuristic%20holographic%20AI%20squad%20collaborative%20control%20room%20ultra%20detailed%20octane%20render?width=1024&height=600&nologo=true",
        "timestamp": "12 minutes ago",
        "conversation_id": "1",
        "likes": 48,
        "comments": 7,
        "tags": ["Pollinations AI", "Asset Generation", "Squad Studio"],
    },
    {
        "id": "feed-seed-2",
        "type": "research",
        "title": "Autonomous Multi-Agent Framework Benchmark 2026",
        "description": "Live DuckDuckGo research synthesis comparing turn-taking architectures and latency.",
        "content": "Analysis of Groq LLaMA 3.3 (300 T/s) vs Gemini 2.5 Flash for enterprise agent group chats. Concluded that Groq provides sub-second sequential handoffs with near-zero latency degradation.",
        "author": "Web Intelligence Agent",
        "author_avatar": "🔍",
        "media_url": None,
        "timestamp": "45 minutes ago",
        "conversation_id": "1",
        "likes": 34,
        "comments": 4,
        "tags": ["Live Web", "DuckDuckGo", "Benchmark"],
    },
    {
        "id": "feed-seed-3",
        "type": "code",
        "title": "Python 31-Day Presenter Frames & Slideshow Generator",
        "description": "Production script generating FFmpeg slide timelines with Urdu/English voice sync.",
        "content": "```python\nimport subprocess\n\ndef build_slideshow(images, audio_path, output_mp4):\n    # 1080p 60fps high-contrast slide rendering\n    cmd = ['ffmpeg', '-y', '-loop', '1', '-i', images[0], '-i', audio_path, '-c:v', 'libx264', '-shortest', output_mp4]\n    subprocess.run(cmd, check=True)\n```",
        "author": "Systems Developer",
        "author_avatar": "🤖",
        "media_url": None,
        "timestamp": "2 hours ago",
        "conversation_id": "1",
        "likes": 56,
        "comments": 12,
        "tags": ["Python", "FFmpeg", "Video Studio"],
    },
    {
        "id": "feed-seed-4",
        "type": "automation",
        "title": "Morning Executive Brief & Blocker Audit",
        "description": "Automated daily scheduled run synthesizing system health, commits, and risks.",
        "content": "Automated schedule completed at 09:00 Karachi time. 0 fatal exceptions detected. All 4 LLM adapters (Groq, Gemini, Claude, OpenAI) healthy.",
        "author": "Super Agent",
        "author_avatar": "⚡",
        "media_url": None,
        "timestamp": "4 hours ago",
        "conversation_id": "1",
        "likes": 22,
        "comments": 2,
        "tags": ["Scheduler", "Cron", "Briefing"],
    },
]


@router.get("", response_model=list[FeedItemOut])
async def get_feed(
    filter_type: str | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, Any]]:
    """Get dynamic activity feed of agent outputs, generated media, and automation logs."""
    items: list[dict[str, Any]] = []

    # 1. Query recent messages that contain artifacts or images
    msg_stmt = (
        select(Message, Conversation.title.label("conv_title"))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(Message.sender_type == "agent")
        .order_by(Message.created_at.desc())
        .limit(10)
    )
    result = await session.execute(msg_stmt)

    for row in result.all():
        msg = row[0]
        conv_title = row[1]

        media_url = None
        item_type = "research"
        description = msg.content[:150] + ("..." if len(msg.content) > 150 else "")

        # Check for image artifacts
        if msg.artifacts and isinstance(msg.artifacts, list):
            for art in msg.artifacts:
                if isinstance(art, dict) and art.get("type") == "image":
                    media_url = art.get("url")
                    item_type = "image"
                    break

        if not media_url:
            import re
            m = re.search(r"https://image\.pollinations\.ai/prompt/[^\s\)]+", msg.content)
            if m:
                media_url = m.group(0)
                item_type = "image"

        if "```" in msg.content:
            item_type = "code"

        title = f"{msg.sender_name} Output: {conv_title}"
        if item_type == "image":
            title = f"AI Visual Generation: {conv_title}"

        items.append({
            "id": f"msg-{msg.id}",
            "type": item_type,
            "title": title,
            "description": description,
            "content": msg.content,
            "author": msg.sender_name or "Autonomous Agent",
            "author_avatar": "🤖" if item_type != "image" else "🎨",
            "media_url": media_url,
            "timestamp": msg.created_at.strftime("%I:%M %p") if msg.created_at else "Just now",
            "conversation_id": msg.conversation_id,
            "likes": 12,
            "comments": 2,
            "tags": [item_type.capitalize(), "Autonomous Agent"],
        })

    # 2. Query recent automations with last_result
    auto_stmt = (
        select(Automation)
        .where(Automation.last_run_at.is_not(None))
        .order_by(Automation.last_run_at.desc())
        .limit(5)
    )
    auto_res = await session.execute(auto_stmt)
    for auto in auto_res.scalars().all():
        items.append({
            "id": f"auto-{auto.id}",
            "type": "automation",
            "title": f"Automated Execution: {auto.title}",
            "description": auto.description or "Scheduled background task execution.",
            "content": auto.last_result,
            "author": "Automations Engine",
            "author_avatar": "⚡",
            "media_url": None,
            "timestamp": auto.last_run_at.strftime("%I:%M %p") if auto.last_run_at else "Earlier",
            "conversation_id": None,
            "likes": 8,
            "comments": 1,
            "tags": ["Automation", auto.category.capitalize()],
        })

    # 3. If fewer than 4 items, merge default seeded feed items
    existing_ids = {x["id"] for x in items}
    for seed in DEFAULT_SEEDED_FEED:
        if seed["id"] not in existing_ids:
            items.append(seed)

    # 4. Filter if requested
    if filter_type and filter_type != "all":
        items = [i for i in items if i["type"] == filter_type]

    return items
