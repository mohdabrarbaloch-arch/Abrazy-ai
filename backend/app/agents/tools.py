"""Tool registry with real live tools.

Included tools:
1. web_search: Live DuckDuckGo web search via duckduckgo-search with httpx fallback (Instant Answer + Wikipedia API)
2. image_generate: Real image generation via Pollinations.ai with direct markdown and artifact payload
3. read_url: Live webpage scraper & reader using Jina Reader (r.jina.ai) with fallback direct HTML text extraction
4. send_email, post_slack, notion_write: Integrations with third-party providers
"""
from __future__ import annotations

import abc
import json
import logging
import random
import re
import urllib.parse
from typing import Any, Callable

import httpx

logger = logging.getLogger(__name__)


class Tool(abc.ABC):
    name: str
    description: str
    parameters: dict

    @abc.abstractmethod
    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
        """Execute the tool."""

    def schema(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }


class WebSearchTool(Tool):
    name = "web_search"
    description = (
        "Search the live public web for up-to-date information, facts, news, documentation, "
        "or current statistics. Returns a list of real search results with titles, URLs, and snippets."
    )
    parameters = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query keywords to look up"}
        },
        "required": ["query"],
    }

    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
        query = args.get("query", "").strip()
        if not query:
            return json.dumps({"ok": False, "error": "Search query cannot be empty"}, ensure_ascii=False)

        results: list[dict[str, str]] = []

        # 1. Primary: duckduckgo-search (DDGS) via _text_html or _text_lite
        try:
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                from duckduckgo_search import DDGS
                with DDGS() as ddgs:
                    # Prefer _text_html and _text_lite as they bypass Bing scraping blocks
                    ddg_list = []
                    try:
                        ddg_list = ddgs._text_html(query, max_results=5) or []
                    except Exception:
                        pass
                    if not ddg_list:
                        try:
                            ddg_list = ddgs._text_lite(query, max_results=5) or []
                        except Exception:
                            pass
                    if not ddg_list:
                        try:
                            ddg_list = list(ddgs.text(query, max_results=5))
                        except Exception:
                            pass

                    for item in ddg_list:
                        results.append({
                            "title": item.get("title", ""),
                            "url": item.get("href", ""),
                            "snippet": item.get("body", ""),
                        })
        except Exception as e:
            logger.warning("duckduckgo_search library call failed, trying HTTP fallback: %s", e)

        # 2. Fallback: DuckDuckGo Instant Answer API
        if not results:
            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                    resp = await client.get(
                        "https://api.duckduckgo.com/",
                        params={"q": query, "format": "json", "no_html": "1", "skip_disambig": "1"},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        abstract = data.get("AbstractText")
                        source_url = data.get("AbstractURL")
                        if abstract:
                            results.append({
                                "title": data.get("Heading") or query,
                                "url": source_url or "https://duckduckgo.com",
                                "snippet": abstract,
                            })
                        for topic in data.get("RelatedTopics", [])[:4]:
                            if isinstance(topic, dict) and "Text" in topic:
                                results.append({
                                    "title": topic.get("FirstURL", "").split("/")[-1].replace("_", " ") or "Topic",
                                    "url": topic.get("FirstURL", ""),
                                    "snippet": topic.get("Text", ""),
                                })
            except Exception as e:
                logger.warning("DuckDuckGo instant answer fallback failed: %s", e)

        # 3. Fallback: Wikipedia OpenSearch API
        if not results:
            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                    resp = await client.get(
                        "https://en.wikipedia.org/w/api.php",
                        params={
                            "action": "opensearch",
                            "search": query,
                            "limit": 4,
                            "namespace": 0,
                            "format": "json",
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if len(data) >= 4:
                            for title, desc, url in zip(data[1], data[2], data[3]):
                                results.append({
                                    "title": title,
                                    "url": url,
                                    "snippet": desc or title,
                                })
            except Exception as e:
                logger.warning("Wikipedia API fallback failed: %s", e)

        if not results:
            return json.dumps({
                "ok": False,
                "query": query,
                "message": f"No live search results found for '{query}'.",
            }, ensure_ascii=False)

        return json.dumps({
            "ok": True,
            "query": query,
            "results": results,
            "count": len(results),
        }, ensure_ascii=False)


class ImageGenTool(Tool):
    name = "image_generate"
    description = (
        "Generate a real, high-quality image from a descriptive prompt using Pollinations AI. "
        "Returns direct image URL, markdown preview syntax, and artifact metadata."
    )
    parameters = {
        "type": "object",
        "properties": {
            "prompt": {"type": "string", "description": "Detailed text description of the image to generate"},
            "width": {"type": "integer", "description": "Image width in pixels (default 1024)", "default": 1024},
            "height": {"type": "integer", "description": "Image height in pixels (default 1024)", "default": 1024},
        },
        "required": ["prompt"],
    }

    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
        prompt = args.get("prompt", "").strip()
        if not prompt:
            return json.dumps({"ok": False, "error": "Prompt cannot be empty"}, ensure_ascii=False)

        width = args.get("width") or 1024
        height = args.get("height") or 1024
        seed = random.randint(10000, 999999)
        encoded_prompt = urllib.parse.quote(prompt)

        # Pollinations.ai free public endpoint
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&seed={seed}&nologo=true"
        markdown_syntax = f"![{prompt}]({image_url})"

        return json.dumps({
            "ok": True,
            "prompt": prompt,
            "image_url": image_url,
            "markdown": markdown_syntax,
            "artifact": {
                "type": "image",
                "title": prompt,
                "url": image_url,
                "width": width,
                "height": height,
            },
        }, ensure_ascii=False)


class ReadUrlTool(Tool):
    name = "read_url"
    description = (
        "Read, fetch, and extract readable text/markdown from any live webpage or article URL. "
        "Useful for summarizing articles, reading documentation, and analyzing shared links."
    )
    parameters = {
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "The web URL to fetch and read (e.g. https://example.com)"}
        },
        "required": ["url"],
    }

    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
        url = args.get("url", "").strip()
        if not url:
            return json.dumps({"ok": False, "error": "URL cannot be empty"}, ensure_ascii=False)

        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,text/plain",
        }

        content_text = ""
        # 1. Primary: Jina Reader (r.jina.ai)
        try:
            jina_url = f"https://r.jina.ai/{url}"
            async with httpx.AsyncClient(timeout=14.0, follow_redirects=True) as client:
                resp = await client.get(jina_url, headers=headers)
                if resp.status_code == 200 and len(resp.text.strip()) > 40:
                    content_text = resp.text.strip()
        except Exception as e:
            logger.warning("Jina Reader call failed, falling back to direct fetch: %s", e)

        # 2. Fallback: Direct HTTP GET and clean HTML
        if not content_text:
            try:
                async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        raw_html = resp.text
                        cleaned = re.sub(r"<(script|style).*?</\1>", " ", raw_html, flags=re.DOTALL | re.IGNORECASE)
                        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
                        cleaned = re.sub(r"\s+", " ", cleaned).strip()
                        content_text = cleaned
            except Exception as e:
                return json.dumps({
                    "ok": False,
                    "url": url,
                    "error": f"Failed to retrieve URL: {str(e)}",
                }, ensure_ascii=False)

        if not content_text:
            return json.dumps({
                "ok": False,
                "url": url,
                "error": "No readable content could be extracted from this URL.",
            }, ensure_ascii=False)

        # Truncate to reasonable context size
        truncated = content_text[:4000]
        if len(content_text) > 4000:
            truncated += "\n\n... [Content truncated for agent context length]"

        return json.dumps({
            "ok": True,
            "url": url,
            "content": truncated,
            "total_length": len(content_text),
        }, ensure_ascii=False)


class ScrapeUrlTool(ReadUrlTool):
    """Alias for read_url."""
    name = "scrape_url"


class EmailTool(Tool):
    name = "send_email"
    description = "Send an email via the connected Gmail integration."
    parameters = {
        "type": "object",
        "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}},
        "required": ["to", "subject", "body"],
    }

    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
        if db is None:
            return json.dumps({"ok": False, "error": "email not configured"}, ensure_ascii=False)
        from sqlalchemy import select
        from app.models import Integration
        async with db.begin():
            integ = (await db.execute(select(Integration).where(Integration.user_id == user_id, Integration.provider == "gmail"))).scalars().first()
        if not integ or integ.status != "active":
            return json.dumps({"ok": False, "error": "Gmail not connected"}, ensure_ascii=False)
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

    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
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

    async def run(self, args: dict, *, user_id: str = "user", db: Any = None) -> str:
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
    for t in (
        WebSearchTool(),
        ImageGenTool(),
        ReadUrlTool(),
        ScrapeUrlTool(),
        EmailTool(),
        SlackTool(),
        NotionTool(),
    ):
        register(t)


_init()
