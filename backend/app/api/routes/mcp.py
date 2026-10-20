"""MCP (Model Context Protocol) API endpoints.

Exposes MCP client tools to the frontend for discovery and management.
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.mcp.client import get_mcp_client
from app.models import User

router = APIRouter(prefix="/mcp", tags=["mcp"])
logger = logging.getLogger(__name__)


class MCPToolSchema(BaseModel):
    """MCP Tool schema for API response."""

    name: str
    display_name: str
    description: str
    source: str
    category: str | None = None
    parameters: dict[str, Any] | None = None


class MCPToolsResponse(BaseModel):
    """Response for MCP tools listing."""

    tools: list[MCPToolSchema]
    count: int
    sources: dict[str, int]  # source -> count


class MCPProviderToolsResponse(BaseModel):
    """Response for provider-specific tools."""

    provider: str
    tools: list[MCPToolSchema]
    count: int


@router.get("/tools", response_model=MCPToolsResponse)
async def list_mcp_tools(
    source_filter: str | None = None,
    user: User = Depends(get_current_user),
):
    """
    List all available MCP tools from connected servers.

    Query params:
        - source_filter: Optional filter by source (e.g., "abrazy", "composio", "local")

    Returns:
        List of all available tools with their schemas
    """
    try:
        client = await get_mcp_client()
        raw_tools = await client.list_tools(source_filter=source_filter)

        # Transform to API schema
        tools = []
        sources_count: dict[str, int] = {}

        for tool in raw_tools:
            source = tool.get("source", "unknown")
            sources_count[source] = sources_count.get(source, 0) + 1

            # Categorize tools
            tool_name = tool["name"]
            category = _categorize_tool(tool_name, source)

            # Clean display name
            display_name = tool_name.split(".")[-1].replace("_", " ").title()

            tools.append(
                MCPToolSchema(
                    name=tool_name,
                    display_name=display_name,
                    description=tool.get("description", ""),
                    source=source,
                    category=category,
                    parameters=tool.get("inputSchema"),
                )
            )

        return MCPToolsResponse(
            tools=tools,
            count=len(tools),
            sources=sources_count,
        )

    except Exception as e:
        logger.exception("Failed to list MCP tools")
        raise HTTPException(status_code=500, detail=f"Failed to fetch MCP tools: {str(e)}")


@router.get("/tools/provider/{provider}", response_model=MCPProviderToolsResponse)
async def list_provider_tools(
    provider: str,
    user: User = Depends(get_current_user),
):
    """
    List tools for a specific provider (e.g., instagram, gmail, github).

    Path params:
        - provider: Provider name (instagram, gmail, github, notion, slack)

    Returns:
        List of tools available for that provider
    """
    try:
        client = await get_mcp_client()
        raw_tools = client.get_tools_for_provider(provider)

        tools = []
        for tool in raw_tools:
            # Extract category from tool name
            tool_name = tool["name"]
            category = _categorize_provider_tool(tool_name, provider)

            tools.append(
                MCPToolSchema(
                    name=tool_name,
                    display_name=tool.get("display_name", tool_name.split(".")[-1]),
                    description=tool.get("description", ""),
                    source="composio",
                    category=category,
                    parameters=tool.get("inputSchema"),
                )
            )

        return MCPProviderToolsResponse(
            provider=provider,
            tools=tools,
            count=len(tools),
        )

    except Exception as e:
        logger.exception(f"Failed to list tools for provider {provider}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tools for provider {provider}: {str(e)}",
        )


@router.get("/status")
async def mcp_status(user: User = Depends(get_current_user)):
    """
    Get MCP client status and connected servers.

    Returns:
        Status information about connected MCP servers
    """
    try:
        client = await get_mcp_client()

        # Get all tools to analyze sources
        all_tools = await client.list_tools()
        sources: dict[str, Any] = {}

        for tool in all_tools:
            source = tool.get("source", "unknown")
            if source not in sources:
                sources[source] = {"tools": 0, "status": "connected"}
            sources[source]["tools"] += 1

        return {
            "status": "connected",
            "total_tools": len(all_tools),
            "sources": sources,
            "composio_enabled": client.composio_client is not None,
        }

    except Exception as e:
        logger.exception("Failed to get MCP status")
        return {
            "status": "error",
            "error": str(e),
            "total_tools": 0,
            "sources": {},
            "composio_enabled": False,
        }


def _categorize_tool(tool_name: str, source: str) -> str:
    """Categorize tool based on name and source."""
    name_lower = tool_name.lower()

    if "enhance" in name_lower or "prompt" in name_lower:
        return "AI Enhancement"
    elif "agent" in name_lower:
        return "Agent Management"
    elif "execute" in name_lower:
        return "Tool Execution"
    elif "instagram" in name_lower:
        return "Social Media"
    elif "gmail" in name_lower or "email" in name_lower:
        return "Communication"
    elif "github" in name_lower:
        return "Development"
    elif "notion" in name_lower:
        return "Productivity"
    elif source == "abrazy":
        return "Abrazy Core"
    elif source == "composio":
        return "External Integration"
    else:
        return "General"


def _categorize_provider_tool(tool_name: str, provider: str) -> str:
    """Categorize provider-specific tool."""
    name_lower = tool_name.lower()

    if provider == "instagram":
        if "post" in name_lower or "publish" in name_lower:
            return "Posts"
        elif "comment" in name_lower or "reply" in name_lower:
            return "Engagement"
        elif "insight" in name_lower or "analytics" in name_lower:
            return "Analytics"
        elif "profile" in name_lower:
            return "Profile"
        else:
            return "Media"

    elif provider == "gmail":
        if "send" in name_lower:
            return "Send"
        elif "read" in name_lower or "get" in name_lower:
            return "Read"
        elif "draft" in name_lower:
            return "Drafts"
        elif "label" in name_lower:
            return "Organization"
        else:
            return "General"

    elif provider == "github":
        if "repo" in name_lower or "repository" in name_lower:
            return "Repositories"
        elif "issue" in name_lower:
            return "Issues"
        elif "pull" in name_lower or "pr" in name_lower:
            return "Pull Requests"
        elif "commit" in name_lower:
            return "Commits"
        else:
            return "General"

    elif provider == "notion":
        if "page" in name_lower:
            return "Pages"
        elif "database" in name_lower or "db" in name_lower:
            return "Databases"
        elif "block" in name_lower:
            return "Blocks"
        else:
            return "General"

    return "General"
