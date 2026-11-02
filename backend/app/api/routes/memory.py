"""Memory Graph API Routes - Abrazy AI living knowledge graph with auto-seeding & optional auth."""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_optional_user
from app.models import MemoryLink, MemoryNode, User

router = APIRouter()


# 15 Rich Interconnected Nodes matching Teamily's Living Memory Graph
DEMO_NODES = [
    {"title": "Morning Routine Briefing", "category": "Daily Briefings", "color": "#10B981", "size": 16, "content": "Daily sync on critical tasks, agent orchestration status, and overnight automation reports."},
    {"title": "Weekly Goals Review", "category": "Daily Briefings", "color": "#10B981", "size": 14, "content": "Reviewing OKRs, active agent squad milestones, and weekly output targets."},
    {"title": "Sprint Velocity Check", "category": "Daily Briefings", "color": "#10B981", "size": 12, "content": "Tracking task turnaround speed and LLM token efficiencies across runs."},
    {"title": "Abrazy Platform Architecture", "category": "Projects", "color": "#3B82F6", "size": 20, "content": "Core OS specifications: Social Brain Model, multi-agent squads, and living memory graph."},
    {"title": "AI Agent Marketplace", "category": "Projects", "color": "#3B82F6", "size": 18, "content": "Discover and deploy official specialized AI teammates across engineering, finance, legal, and growth."},
    {"title": "Living Memory Graph v2", "category": "Projects", "color": "#3B82F6", "size": 15, "content": "Persistent force-directed knowledge graph mapping user context and agent insights."},
    {"title": "30 Day Content Challenge", "category": "30 Day Challenge", "color": "#F59E0B", "size": 15, "content": "High-intensity multi-platform automated content generation sprint."},
    {"title": "Video Scripts Library", "category": "30 Day Challenge", "color": "#F59E0B", "size": 12, "content": "Categorized viral hooks, storytelling frameworks, and technical breakdown scripts."},
    {"title": "Audience Growth Loops", "category": "30 Day Challenge", "color": "#F59E0B", "size": 11, "content": "Automated engagement funnels linking Twitter, LinkedIn, and YouTube broadcasts."},
    {"title": "Social Media Strategy", "category": "Marketing", "color": "#EC4899", "size": 14, "content": "Omnichannel publishing schedules and personalized audience segmentation."},
    {"title": "Brand Guidelines & Voice", "category": "Marketing", "color": "#EC4899", "size": 12, "content": "Teamily Green color harmony, Lato typography standards, and confident agent tone."},
    {"title": "Shoot Kit Templates", "category": "Video Production", "color": "#8B5CF6", "size": 13, "content": "Standardized B-roll shot lists, lighting setups, and teleprompter cues."},
    {"title": "GPU Rendering Workflow", "category": "Video Production", "color": "#8B5CF6", "size": 14, "content": "Fast ffmpeg video rendering and multi-track audio normalization."},
    {"title": "Asset & Media Library", "category": "Media", "color": "#06B6D4", "size": 12, "content": "Centralized repository for high-res images, brand logos, audio clips, and vector SVGs."},
    {"title": "Local LLM Cluster Setup", "category": "Engineering", "color": "#6366F1", "size": 17, "content": "Hybrid cloud and local inference routing with Groq, Gemini, and Ollama failovers."}
]

# 16 Interconnected links mapping relations
DEMO_LINKS = [
    {"source": 0, "target": 1, "strength": 3, "label": "coordinates"},
    {"source": 1, "target": 2, "strength": 2, "label": "measures"},
    {"source": 3, "target": 4, "strength": 3, "label": "deploys"},
    {"source": 3, "target": 5, "strength": 3, "label": "integrates"},
    {"source": 6, "target": 7, "strength": 2, "label": "generates"},
    {"source": 7, "target": 8, "strength": 2, "label": "distributes"},
    {"source": 9, "target": 10, "strength": 3, "label": "follows"},
    {"source": 6, "target": 9, "strength": 2, "label": "aligns_with"},
    {"source": 11, "target": 12, "strength": 3, "label": "produces"},
    {"source": 7, "target": 11, "strength": 2, "label": "provides_script"},
    {"source": 12, "target": 13, "strength": 2, "label": "stores_in"},
    {"source": 4, "target": 9, "strength": 1, "label": "promotes"},
    {"source": 3, "target": 14, "strength": 3, "label": "powers"},
    {"source": 5, "target": 14, "strength": 2, "label": "syncs_with"},
    {"source": 0, "target": 3, "strength": 1, "label": "tracks"},
    {"source": 8, "target": 10, "strength": 1, "label": "embodies"},
]


async def _get_or_create_effective_user(db: AsyncSession, user: User | None) -> User:
    """Ensure we have an active user ID for memory storage; fallback to default system user."""
    if user:
        return user

    result = await db.execute(select(User).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    new_user = User(
        id=str(uuid.uuid4()),
        email="system@abrazy.ai",
        full_name="Abrazy AI Default User",
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.get("/graph")
async def get_memory_graph(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict[str, Any]:
    """
    Get force-directed knowledge graph for memory overview.
    Compatible with react-force-graph-2d. Optional auth with auto-seeding.
    """
    effective_user = await _get_or_create_effective_user(db, user)

    # Fetch user's memory nodes with link relationships
    result = await db.execute(
        select(MemoryNode)
        .where(or_(MemoryNode.user_id == effective_user.id, MemoryNode.user_id.isnot(None)))
        .options(selectinload(MemoryNode.outgoing_links), selectinload(MemoryNode.incoming_links))
        .order_by(MemoryNode.created_at.desc())
    )
    nodes = result.scalars().all()

    # If no nodes exist in DB, automatically seed the 15 interconnected demo nodes
    if not nodes:
        demo_nodes = []
        for node_data in DEMO_NODES:
            node = MemoryNode(
                user_id=effective_user.id,
                title=node_data["title"],
                category=node_data["category"],
                color=node_data["color"],
                size=node_data["size"],
                content=node_data.get("content", ""),
            )
            db.add(node)
            demo_nodes.append(node)

        await db.flush()  # Generate UUIDs

        for link_data in DEMO_LINKS:
            if link_data["source"] < len(demo_nodes) and link_data["target"] < len(demo_nodes):
                link = MemoryLink(
                    source_id=demo_nodes[link_data["source"]].id,
                    target_id=demo_nodes[link_data["target"]].id,
                    strength=link_data["strength"],
                    label=link_data.get("label"),
                )
                db.add(link)

        await db.commit()

        # Re-fetch populated nodes with link relationships
        result = await db.execute(
            select(MemoryNode)
            .where(MemoryNode.user_id == effective_user.id)
            .options(selectinload(MemoryNode.outgoing_links), selectinload(MemoryNode.incoming_links))
            .order_by(MemoryNode.created_at.desc())
        )
        nodes = result.scalars().all()

    # Fetch all links connecting existing nodes
    node_ids = [n.id for n in nodes]
    links_result = await db.execute(
        select(MemoryLink).where(
            (MemoryLink.source_id.in_(node_ids)) | (MemoryLink.target_id.in_(node_ids))
        )
    )
    links = links_result.scalars().all()

    nodes_data = [
        {
            "id": node.id,
            "title": node.title,
            "category": node.category,
            "color": node.color,
            "size": node.size,
            "content": node.content,
            "created_at": node.created_at.isoformat() if node.created_at else "",
            "updated_at": node.updated_at.isoformat() if node.updated_at else "",
        }
        for node in nodes
    ]

    links_data = [
        {
            "id": link.id,
            "source": link.source_id,
            "target": link.target_id,
            "strength": link.strength,
            "label": link.label,
        }
        for link in links
    ]

    return {
        "nodes": nodes_data,
        "links": links_data,
        "stats": {
            "total_nodes": len(nodes_data),
            "total_links": len(links_data),
            "unlinked": sum(1 for n in nodes if not n.outgoing_links and not n.incoming_links),
        },
    }


@router.get("/topics")
async def get_memory_topics(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict[str, Any]:
    """Get topic categories with counts and connection metrics for filter pills and sidebar."""
    effective_user = await _get_or_create_effective_user(db, user)

    # Count nodes by category
    result = await db.execute(
        select(MemoryNode.category, func.count(MemoryNode.id).label("count"))
        .group_by(MemoryNode.category)
        .order_by(func.count(MemoryNode.id).desc())
    )
    categories = result.all()

    topics = []
    for category, node_count in categories:
        node_ids_result = await db.execute(
            select(MemoryNode.id).where(MemoryNode.category == category)
        )
        node_ids = [row[0] for row in node_ids_result.all()]

        if node_ids:
            links_result = await db.execute(
                select(func.count(MemoryLink.id)).where(
                    (MemoryLink.source_id.in_(node_ids)) | (MemoryLink.target_id.in_(node_ids))
                )
            )
            connection_count = links_result.scalar() or 0
        else:
            connection_count = 0

        topics.append(
            {
                "category": category,
                "node_count": node_count,
                "connection_count": connection_count,
            }
        )

    return {
        "topics": topics,
        "total_categories": len(topics),
    }


@router.get("/stats")
async def get_memory_stats(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict[str, Any]:
    """Get high-level statistics for memory overview bar."""
    graph = await get_memory_graph(db=db, user=user)
    return graph.get("stats", {"total_nodes": 0, "total_links": 0, "unlinked": 0})


@router.post("/nodes")
async def create_memory_node(
    body: dict,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict[str, Any]:
    """Create a new memory node."""
    effective_user = await _get_or_create_effective_user(db, user)
    title = body.get("title", "Untitled Memory")
    category = body.get("category", "General")
    color = body.get("color", "#3B82F6")
    size = body.get("size", 12)
    content = body.get("content", "")

    node = MemoryNode(
        user_id=effective_user.id,
        title=title,
        category=category,
        color=color,
        size=size,
        content=content,
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)

    return {
        "id": node.id,
        "title": node.title,
        "category": node.category,
        "color": node.color,
        "size": node.size,
        "content": node.content,
        "created_at": node.created_at.isoformat() if node.created_at else "",
    }


@router.post("/links")
async def create_memory_link(
    body: dict,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict[str, Any]:
    """Create a new memory link between nodes."""
    source_id = body.get("source_id")
    target_id = body.get("target_id")
    strength = body.get("strength", 1)
    label = body.get("label")

    if not source_id or not target_id:
        raise HTTPException(status_code=400, detail="source_id and target_id are required")

    link = MemoryLink(
        source_id=source_id,
        target_id=target_id,
        strength=strength,
        label=label,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)

    return {
        "id": link.id,
        "source": link.source_id,
        "target": link.target_id,
        "strength": link.strength,
        "label": link.label,
    }
