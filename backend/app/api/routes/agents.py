"""Agent CRUD routes + marketplace + teams."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import Agent, AgentTeam, User
from app.schemas import AgentCreate, AgentOut, AgentUpdate

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentOut])
async def list_agents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    category: str | None = None,
    search: str | None = None,
    is_public: bool | None = None,
    is_official: bool | None = None,
):
    """List agents with optional filters for marketplace"""
    query = select(Agent).where(Agent.owner_id == user.id)
    
    # Apply filters
    if category:
        query = query.where(Agent.category == category)
    if search:
        query = query.where(
            or_(
                Agent.name.ilike(f"%{search}%"),
                Agent.description.ilike(f"%{search}%"),
            )
        )
    if is_public is not None:
        query = query.where(Agent.is_public == is_public)
    if is_official is not None:
        query = query.where(Agent.is_official == is_official)
    
    query = query.order_by(Agent.created_at.desc())
    rows = (await db.execute(query)).scalars().all()
    return rows


@router.get("/marketplace", response_model=list[AgentOut])
async def list_marketplace_agents(
    db: AsyncSession = Depends(get_db),
    category: str | None = None,
    search: str | None = None,
    official_only: bool = False,
    limit: int = Query(default=100, le=500),
):
    """Public marketplace - browse all public agents"""
    query = select(Agent).where(Agent.is_public == True)
    
    if official_only:
        query = query.where(Agent.is_official == True)
    if category:
        query = query.where(Agent.category == category)
    if search:
        query = query.where(
            or_(
                Agent.name.ilike(f"%{search}%"),
                Agent.description.ilike(f"%{search}%"),
            )
        )
    
    query = query.order_by(Agent.is_official.desc(), Agent.created_at.desc()).limit(limit)
    rows = (await db.execute(query)).scalars().all()
    return rows


@router.post("", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
async def create_agent(body: AgentCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = Agent(owner_id=user.id, **body.model_dump())
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.get("/{agent_id}", response_model=AgentOut)
async def get_agent(agent_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = (await db.execute(select(Agent).where(Agent.id == agent_id, Agent.owner_id == user.id))).scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.patch("/{agent_id}", response_model=AgentOut)
async def update_agent(agent_id: str, body: AgentUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = (await db.execute(select(Agent).where(Agent.id == agent_id, Agent.owner_id == user.id))).scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(agent, k, v)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = (await db.execute(select(Agent).where(Agent.id == agent_id, Agent.owner_id == user.id))).scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    await db.delete(agent)
    await db.commit()


# --- AGENT TEAMS ---

@router.get("/teams/list", response_model=list[dict])
async def list_agent_teams(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    category: str | None = None,
    is_template: bool | None = None,
):
    """List user's agent teams"""
    query = select(AgentTeam).where(AgentTeam.owner_id == user.id)
    
    if category:
        query = query.where(AgentTeam.category == category)
    if is_template is not None:
        query = query.where(AgentTeam.is_template == is_template)
    
    query = query.order_by(AgentTeam.created_at.desc())
    teams = (await db.execute(query)).scalars().all()
    
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "category": t.category,
            "agent_ids": t.agent_ids,
            "member_ids": t.member_ids,
            "tags": t.tags,
            "is_public": t.is_public,
            "is_template": t.is_template,
            "created_at": t.created_at,
        }
        for t in teams
    ]


@router.get("/teams/marketplace", response_model=list[dict])
async def list_marketplace_teams(
    db: AsyncSession = Depends(get_db),
    category: str | None = None,
    templates_only: bool = True,
):
    """Public marketplace - browse agent team templates"""
    query = select(AgentTeam).where(AgentTeam.is_public == True)
    
    if templates_only:
        query = query.where(AgentTeam.is_template == True)
    if category:
        query = query.where(AgentTeam.category == category)
    
    query = query.order_by(AgentTeam.created_at.desc())
    teams = (await db.execute(query)).scalars().all()
    
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "category": t.category,
            "agent_ids": t.agent_ids,
            "member_count": len(t.agent_ids) + len(t.member_ids),
            "tags": t.tags,
            "is_template": t.is_template,
        }
        for t in teams
    ]


@router.post("/teams", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_agent_team(
    body: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new agent team"""
    team = AgentTeam(
        owner_id=user.id,
        name=body.get("name", "My Team"),
        description=body.get("description", ""),
        category=body.get("category", "General"),
        agent_ids=body.get("agent_ids", []),
        member_ids=body.get("member_ids", []),
        tags=body.get("tags", []),
        is_public=body.get("is_public", False),
        config=body.get("config", {}),
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)
    
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "category": team.category,
        "agent_ids": team.agent_ids,
        "member_ids": team.member_ids,
        "created_at": team.created_at,
    }


@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent_team(
    team_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an agent team"""
    team = (await db.execute(select(AgentTeam).where(AgentTeam.id == team_id, AgentTeam.owner_id == user.id))).scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    await db.delete(team)
    await db.commit()
