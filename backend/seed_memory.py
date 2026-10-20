"""Seed script for Memory Graph demo data.

Run: python seed_memory.py --user-email=user@example.com

Creates a rich knowledge graph with Daily Briefings, Projects, 30 Day Challenge,
Marketing, Video Production, and Media categories with interconnected nodes.
"""
import asyncio
import sys
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import SessionLocal, init_db
from app.models import MemoryLink, MemoryNode, User


DEMO_MEMORY_DATA = {
    "Daily Briefings": [
        {"title": "Morning Routine Briefing", "color": "#10B981", "size": 15, "content": "Daily standup and priority setting"},
        {"title": "Weekly Goals Review", "color": "#10B981", "size": 12, "content": "Track progress on OKRs"},
        {"title": "Evening Reflection", "color": "#10B981", "size": 10, "content": "End of day review and planning"},
    ],
    "Projects": [
        {"title": "Abrazy Platform Roadmap", "color": "#3B82F6", "size": 18, "content": "Q1-Q4 feature planning"},
        {"title": "AI Agent Marketplace", "color": "#3B82F6", "size": 16, "content": "300+ agents ecosystem"},
        {"title": "Multi-Model Integration", "color": "#3B82F6", "size": 14, "content": "OpenAI, Claude, Groq support"},
        {"title": "Real-time Collaboration", "color": "#3B82F6", "size": 12, "content": "WebSocket agent teams"},
    ],
    "30 Day Challenge": [
        {"title": "30 Day Content Challenge", "color": "#F59E0B", "size": 14, "content": "Daily content creation sprint"},
        {"title": "Video Scripts Library", "color": "#F59E0B", "size": 10, "content": "Reusable script templates"},
        {"title": "Day 1: Introduction", "color": "#F59E0B", "size": 8, "content": "Welcome video script"},
        {"title": "Day 7: Weekly Recap", "color": "#F59E0B", "size": 8, "content": "Progress update template"},
    ],
    "Marketing": [
        {"title": "Social Media Strategy", "color": "#EC4899", "size": 13, "content": "Cross-platform content plan"},
        {"title": "Brand Guidelines", "color": "#EC4899", "size": 11, "content": "Visual identity and voice"},
        {"title": "Influencer Outreach", "color": "#EC4899", "size": 9, "content": "Partnership opportunities"},
        {"title": "Launch Campaign", "color": "#EC4899", "size": 12, "content": "Product launch strategy"},
    ],
    "Video Production": [
        {"title": "Shoot Kit Templates", "color": "#8B5CF6", "size": 12, "content": "Production checklists"},
        {"title": "Editing Workflow", "color": "#8B5CF6", "size": 10, "content": "Post-production pipeline"},
        {"title": "Color Grading Presets", "color": "#8B5CF6", "size": 8, "content": "LUTs and filters"},
        {"title": "Audio Mixing Guide", "color": "#8B5CF6", "size": 8, "content": "Sound design standards"},
    ],
    "Media": [
        {"title": "Equipment Checklist", "color": "#06B6D4", "size": 9, "content": "Camera, lighting, audio gear"},
        {"title": "Asset Library", "color": "#06B6D4", "size": 11, "content": "Stock footage and music"},
        {"title": "Location Scouting", "color": "#06B6D4", "size": 8, "content": "Filming locations database"},
    ],
}

# Define connections between nodes (category:index -> category:index)
DEMO_CONNECTIONS = [
    ("Daily Briefings:0", "Daily Briefings:1", 2),  # Morning → Weekly
    ("Daily Briefings:1", "Daily Briefings:2", 2),  # Weekly → Evening
    ("Projects:0", "Projects:1", 3),  # Roadmap → Marketplace
    ("Projects:1", "Projects:2", 2),  # Marketplace → Multi-Model
    ("Projects:2", "Projects:3", 2),  # Multi-Model → Real-time
    ("30 Day Challenge:0", "30 Day Challenge:1", 2),  # Challenge → Scripts
    ("30 Day Challenge:1", "30 Day Challenge:2", 1),  # Scripts → Day 1
    ("30 Day Challenge:1", "30 Day Challenge:3", 1),  # Scripts → Day 7
    ("Marketing:0", "Marketing:1", 2),  # Strategy → Brand
    ("Marketing:0", "Marketing:2", 1),  # Strategy → Influencer
    ("Marketing:3", "Marketing:0", 2),  # Launch → Strategy
    ("Video Production:0", "Video Production:1", 2),  # Shoot Kit → Editing
    ("Video Production:1", "Video Production:2", 1),  # Editing → Color Grading
    ("Video Production:1", "Video Production:3", 1),  # Editing → Audio Mixing
    ("Media:0", "Media:2", 1),  # Equipment → Location
    ("Media:1", "Video Production:1", 1),  # Asset Library → Editing
    ("30 Day Challenge:1", "Video Production:0", 1),  # Scripts → Shoot Kit
    ("Projects:1", "Marketing:0", 1),  # Marketplace → Marketing
    ("Video Production:1", "Media:0", 1),  # Editing → Equipment
    ("30 Day Challenge:0", "Marketing:3", 1),  # Challenge → Launch
]


async def seed_memory_graph(user_email: str = "user@example.com"):
    """Seed memory graph for a specific user."""
    await init_db()

    async with SessionLocal() as db:
        # Find or create user
        result = await db.execute(select(User).where(User.email == user_email))
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ User {user_email} not found. Please create user first.")
            return

        print(f"🌱 Seeding memory graph for user: {user.email}")

        # Check if memory nodes already exist
        existing = await db.execute(
            select(MemoryNode).where(MemoryNode.user_id == user.id).limit(1)
        )
        if existing.scalar_one_or_none():
            print("⚠️  Memory nodes already exist for this user. Skipping seed.")
            return

        # Create all nodes organized by category
        node_map = {}  # key: "category:index" -> MemoryNode
        total_nodes = 0

        for category, nodes_data in DEMO_MEMORY_DATA.items():
            print(f"📦 Creating {len(nodes_data)} nodes in '{category}'...")
            for idx, node_data in enumerate(nodes_data):
                node = MemoryNode(
                    user_id=user.id,
                    title=node_data["title"],
                    category=category,
                    color=node_data["color"],
                    size=node_data["size"],
                    content=node_data.get("content", ""),
                )
                db.add(node)
                node_map[f"{category}:{idx}"] = node
                total_nodes += 1

        await db.flush()  # Get IDs for all nodes

        # Create connections
        print(f"🔗 Creating {len(DEMO_CONNECTIONS)} connections...")
        total_links = 0

        for source_key, target_key, strength in DEMO_CONNECTIONS:
            source_node = node_map.get(source_key)
            target_node = node_map.get(target_key)

            if source_node and target_node:
                link = MemoryLink(
                    source_id=source_node.id,
                    target_id=target_node.id,
                    strength=strength,
                )
                db.add(link)
                total_links += 1
            else:
                print(f"⚠️  Skipping link {source_key} -> {target_key} (node not found)")

        await db.commit()

        print(f"\n✅ Memory graph seeded successfully!")
        print(f"   📊 Total nodes: {total_nodes}")
        print(f"   🔗 Total links: {total_links}")
        print(f"   👤 User: {user.email}")
        print(f"\n🌐 Visit: http://localhost:3000/memory")


async def clear_memory_graph(user_email: str = "user@example.com"):
    """Clear all memory nodes for a user (useful for re-seeding)."""
    await init_db()

    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == user_email))
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ User {user_email} not found.")
            return

        # Delete all nodes (cascade deletes links)
        result = await db.execute(select(MemoryNode).where(MemoryNode.user_id == user.id))
        nodes = result.scalars().all()

        for node in nodes:
            await db.delete(node)

        await db.commit()
        print(f"🗑️  Cleared {len(nodes)} memory nodes for {user.email}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed memory graph demo data")
    parser.add_argument(
        "--user-email",
        default="user@example.com",
        help="Email of user to seed memory graph for",
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing memory nodes before seeding",
    )

    args = parser.parse_args()

    if args.clear:
        asyncio.run(clear_memory_graph(args.user_email))
    else:
        asyncio.run(seed_memory_graph(args.user_email))
