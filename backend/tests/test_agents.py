"""Unit tests: LLM adapter selection + tool registry + orchestrator parsing."""
import pytest

from app.agents import tools as toolmod
from app.agents.llm import get_adapter
from app.agents.orchestrator import _contains_tool_request, _parse_tool_request
from app.core.config import settings


def test_get_adapter_ollama_default():
    settings.LLM_PROVIDER = "ollama"
    assert get_adapter().provider == "ollama"


def test_get_adapter_openai_requires_key(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)
    settings.LLM_PROVIDER = "openai"
    with pytest.raises(RuntimeError):
        get_adapter("openai")


def test_tool_registry_has_core_tools():
    names = {t.name for t in toolmod.all_tools()}
    assert {"web_search", "image_generate", "send_email", "post_slack", "notion_write"} <= names


def test_tool_schemas_structure():
    schemas = toolmod.tool_schemas(["web_search"])
    assert len(schemas) == 1
    s = schemas[0]
    assert s["name"] == "web_search"
    assert "parameters" in s and "required" in s["parameters"]


def test_web_search_tool_runs_offline():
    import asyncio

    out = asyncio.run(toolmod.WebSearchTool().run({"query": "ai agents"}, user_id="u1"))
    assert "results" in out


def test_email_tool_unconfigured_safe():
    import asyncio

    out = asyncio.run(toolmod.EmailTool().run({"to": "a@b.c", "subject": "s", "body": "b"}, user_id="u1", db=None))
    assert '"ok": false' in out


def test_orchestrator_detects_tool_request():
    text = "I will call <<tool {\"name\": \"web_search\", \"arguments\": {\"query\": \"x\"}}>> now"
    assert _contains_tool_request(text)
    call = _parse_tool_request(text)
    assert call["name"] == "web_search"
    assert call["arguments"] == {"query": "x"}


def test_orchestrator_ignores_plain_text():
    assert not _contains_tool_request("just a normal reply")
    assert _parse_tool_request("no tool here") is None
