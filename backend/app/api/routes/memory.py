"""Memory Graph API Routes - Abrazy AI knowledge graph."""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models import MemoryLink, MemoryNode, User

router = APIRouter()


# Demo seed data for empty graphs
DEMO_NODES = [
    {"title": "Morning Routine Briefing", "category": "Daily Briefings", "color": "#10B981", "size": 15},
    {"title": "Weekly Goals Review", "category": "Daily Briefings", "color": "#10B981", "size": 12},
    {"title": "Abrazy Platform Roadmap", "category": "Projects", "color": "#3B82F6", "size": 18},
    {"title": "AI Agent Marketplace", "category": "Projects", "color": "#3B82F6", "size": 16},
    {"title": "30 Day Content Challenge", "category": "30 Day Challenge", "color": "#F59E0B", "size": 14},
    {"title": "Video Scripts Library", "category": "30 Day Challenge", "color": "#F59E0B", "size": 10},
    {"title": "Social Media Strategy", "category": "Marketing", "color": "#EC4899", "size": 13},
    {"title": "Brand Guidelines", "category": "Marketing", "color": "#EC4899", "size": 11},
    {"title": "Shoot Kit Templates", "category": "Video Production", "color": "#8B5CF6", "size": 12},
    {"title": "Editing Workflow", "category": "Video Production", "color": "#8B5CF6", "size": 10},
    {"title": "Equipment Checklist", "category": "Media", "color": "#06B6D4", "size": 9},
    {"title": "Asset Library", "category": "Media", "color": "#06B6D4", "size": 11},
]

# Demo links connecting nodes (0-indexed)
DEMO_LINKS = [
    {"source": 0, "target": 1, "strength": 2},  # Morning → Weekly
    {"source": 2, "target": 3, "strength": 3},  # Roadmap → Marketplace
    {"source": 4, "target": 5, "strength": 2},  # Challenge → Scripts
    {"source": 6, "target": 7, "strength": 2},  # Strategy → Brand
    {"source": 8, "target": 9, "strength": 2},  # Shoot Kit → Editing
    {"source": 5, "target": 8, "strength": 1},  # Scripts → Shoot Kit
    {"source": 3, "target": 6, "strength": 1},  # Marketplace → Marketing
    {"source": 9, "target": 10, "strength": 1},  # Editing → Equipment
    {"source": 10, "target": 11, "strength": 2},  # Equipment → Assets
    {"source": 4, "target": 6, "strength": 1},  # Challenge → Marketing
]


@router.get("/graph")
async def get_memory_graph(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Get force-directed knowledge graph for memory overview.
    Returns nodes and links in format compatible with react-force-graph-2d.
    """
    # Fetch user's memory nodes with link relationships
    result = await db.execute(
        select(MemoryNode)
        .where(MemoryNode.user_id == current_user.id)
        .options(selectinload(MemoryNode.outgoing_links), selectinload(MemoryNode.incoming_links))
        .order_by(MemoryNode.created_at.desc())
    )
    nodes = result.scalars().all()

    # If no nodes exist, create demo seed data
    if not nodes:
        demo_nodes = []
        for node_data in DEMO_NODES:
            node = MemoryNode(
                user_id=current_user.id,
                title=node_data["title"],
                category=node_data["category"],
                color=node_data["color"],
                size=node_data["size"],
            )
            db.add(node)
            demo_nodes.append(node)

        await db.flush()  # Get IDs for nodes

        # Create demo links
        for link_data in DEMO_LINKS:
            link = MemoryLink(
                source_id=demo_nodes[link_data["source"]].id,
                target_id=demo_nodes[link_data["target"]].id,
                strength=link_data["strength"],
            )
            db.add(link)

        await db.commit()

        # Re-fetch with relationships
        result = await db.execute(
            select(MemoryNode)
            .where(MemoryNode.user_id == current_user.id)
            .options(selectinload(MemoryNode.outgoing_links))
            .order_by(MemoryNode.created_at.desc())
        )
        nodes = result.scalars().all()

    # Fetch all links for this user's nodes
    node_ids = [n.id for n in nodes]
    links_result = await db.execute(
        select(MemoryLink).where(
            (MemoryLink.source_id.in_(node_ids)) | (MemoryLink.target_id.in_(node_ids))
        )
    )
    links = links_result.scalars().all()

    # Format for react-force-graph
    nodes_data = [
        {
            "id": node.id,
            "title": node.title,
            "category": node.category,
            "color": node.color,
            "size": node.size,
            "content": node.content,
            "created_at": node.created_at.isoformat(),
            "updated_at": node.updated_at.isoformat(),
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
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Get topic categories with counts and connection metrics.
    Used for filter pills and topic highlights sidebar.
    """
    # Count nodes by category
    result = await db.execute(
        select(MemoryNode.category, func.count(MemoryNode.id).label("count"))
        .where(MemoryNode.user_id == current_user.id)
        .group_by(MemoryNode.category)
        .order_by(func.count(MemoryNode.id).desc())
    )
    categories = result.all()

    # Get connection counts per category
    topics = []
    for category, node_count in categories:
        # Count links for nodes in this category
        node_ids_result = await db.execute(
            select(MemoryNode.id).where(
                MemoryNode.user_id == current_user.id, MemoryNode.category == category
            )
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


@router.post("/nodes")
async def create_memory_node(
    title: str,
    category: str,
    color: str = "#3B82F6",
    size: int = 10,
    content: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a new memory node."""
    node = MemoryNode(
        user_id=current_user.id,
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
        "created_at": node.created_at.isoformat(),
    }


@router.post("/links")
async def create_memory_link(
    source_id: str,
    target_id: str,
    strength: int = 1,
    label: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a new memory link between nodes."""
    # Verify both nodes belong to current user
    result = await db.execute(
        select(MemoryNode).where(
            MemoryNode.id.in_([source_id, target_id]), MemoryNode.user_id == current_user.id
        )
    )
    nodes = result.scalars().all()

    if len(nodes) != 2:
        raise HTTPException(status_code=404, detail="One or both nodes not found")

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


@router.delete("/nodes/{node_id}")
async def delete_memory_node(
    node_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Delete a memory node (cascade deletes links)."""
    result = await db.execute(
        select(MemoryNode).where(MemoryNode.id == node_id, MemoryNode.user_id == current_user.id)
    )
    node = result.scalar_one_or_none()

    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    await db.delete(node)
    await db.commit()

    return {"message": "Node deleted successfully"}


@router.delete("/links/{link_id}")
async def delete_memory_link(
    link_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Delete a memory link."""
    # Verify link belongs to user's nodes
    result = await db.execute(
        select(MemoryLink)
        .join(MemoryNode, MemoryLink.source_id == MemoryNode.id)
        .where(MemoryLink.id == link_id, MemoryNode.user_id == current_user.id)
    )
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    await db.delete(link)
    await db.commit()

    return {"message": "Link deleted successfully"}

