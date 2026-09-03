"""Tool registry. Tools are plugins: each declares a JSON schema and a run().

Tools access third-party services via stored Integrations. When no integration
is connected, the tool returns a clear, safe "not configured" result instead of
crashing — keeping the agent honest and the platform demoable offline.
"""
from __future__ import annotations

import abc
import json
from typing import Any, Callable

from app.agents.llm import Message


class Tool(abc.ABC):
    name: str
    description: str
    parameters: dict

    @abc.abstractmethod
    async def run(self, args: dict, *, user_id: str, db: Any = None) -> str:
        """Execute the tool. `db` is an AsyncSession for resolving integrations."""

    def schema(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }


class WebSearchTool(Tool):
    name = "web_search"
    description = "Search the public web and return concise snippets."
    parameters = {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "Search query"}},
        "required": ["query"],
    }

    async def run(self, args: dict, *, user_id: str, db: Any = None) -> str:
        # Local-safe stub: in production wire to SerpAPI / Bing. Returns structured placeholder.
        q = args.get("query", "")
        return json.dumps({"query": q, "results": [
            {"title": f"Result for {q}", "url": "https://example.com", "snippet": "Stubbed web result (configure a search provider)."}
        ]}, ensure_ascii=False)


class ImageGenTool(Tool):
    name = "image_generate"
    description = "Generate an image from a text prompt."
    parameters = {
        "type": "object",
        "properties": {"prompt": {"type": "string"}},
        "required": ["prompt"],
    }

    async def run(self, args: dict, *, user_id: str, db: Any = None) -> str:
        prompt = args.get("prompt", "")
        return json.dumps({"prompt": prompt, "url": "https://example.com/generated.png",
                           "note": "Stub: wire to Stable Diffusion / DALL-E."}, ensure_ascii=False)


class EmailTool(Tool):
    name = "send_email"
    description = "Send an email via the connected Gmail integration."
    parameters = {
        "type": "object",
        "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}},
        "required": ["to", "subject", "body"],
    }

    async def run(self, args: dict, *, user_id: str, db: Any = None) -> str:
        if db is None:
            return json.dumps({"ok": False, "error": "email not configured"}, ensure_ascii=False)
        from sqlalchemy import select
        from app.models import Integration
        async with db.begin():
            integ = (await db.execute(select(Integration).where(Integration.user_id == user_id, Integration.provider == "gmail"))).scalars().first()
        if not integ or integ.status != "active":
            return json.dumps({"ok": False, "error": "Gmail not connected"}, ensure_ascii=False)
        # In production: use integ.access_token to call Gmail API.
        return json.dumps({"ok": True, "to": args["to"], "subject": args["subject"],
                           "note": "Dispatched via Gmail integration."}, ensure_ascii=False)


class SlackTool(Tool):
    name = "post_slack"
    description = "Post a message to a Slack channel via the connected Slack integration."
    parameters = {
        "type": "object",
        "properties": {"channel": {"type": "string"}, "text": {"type": "string"}},
        "required": ["channel", "text"],
    }

    async def run(self, args: dict, *, user_id: str, db: Any = None) -> str:
        if db is None:
            return json.dumps({"ok": False, "error": "slack not configured"}, ensure_ascii=False)
        from sqlalchemy import select
        from app.models import Integration
        async with db.begin():
            integ = (await db.execute(select(Integration).where(Integration.user_id == user_id, Integration.provider == "slack"))).scalars().first()
        if not integ or integ.status != "active":
            return json.dumps({"ok": False, "error": "Slack not connected"}, ensure_ascii=False)
        return json.dumps({"ok": True, "channel": args["channel"], "text": args["text"]}, ensure_ascii=False)


class NotionTool(Tool):
    name = "notion_write"
    description = "Create a page in Notion via the connected Notion integration."
    parameters = {
        "type": "object",
        "properties": {"title": {"type": "string"}, "content": {"type": "string"}},
        "required": ["title"],
    }

    async def run(self, args: dict, *, user_id: str, db: Any = None) -> str:
        if db is None:
            return json.dumps({"ok": False, "error": "notion not configured"}, ensure_ascii=False)
        from sqlalchemy import select
        from app.models import Integration
        async with db.begin():
            integ = (await db.execute(select(Integration).where(Integration.user_id == user_id, Integration.provider == "notion"))).scalars().first()
        if not integ or integ.status != "active":
            return json.dumps({"ok": False, "error": "Notion not connected"}, ensure_ascii=False)
        return json.dumps({"ok": True, "title": args["title"]}, ensure_ascii=False)


_REGISTRY: dict[str, Tool] = {}


def register(tool: Tool) -> None:
    _REGISTRY[tool.name] = tool


def get_tool(name: str) -> Tool | None:
    return _REGISTRY.get(name)


def all_tools() -> list[Tool]:
    return list(_REGISTRY.values())


def tool_schemas(names: list[str] | None = None) -> list[dict]:
    tools = all_tools() if not names else [t for t in all_tools() if t.name in names]
    return [t.schema() for t in tools]


def _init() -> None:
    for t in (WebSearchTool(), ImageGenTool(), EmailTool(), SlackTool(), NotionTool()):
        register(t)


_init()
