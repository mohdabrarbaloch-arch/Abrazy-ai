"""LLM provider adapters.

Ollama is the zero-key local default. OpenAI / Anthropic are env-gated adapters
so the same orchestrator works in production without code changes.
"""
from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator

import httpx

from app.core.config import settings


@dataclass
class Message:
    role: str  # system | user | assistant | tool
    content: str
    tool_call_id: str | None = None


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict


@dataclass
class CompletionChunk:
    delta: str = ""
    tool_calls: list[ToolCall] | None = None
    done: bool = False


class LLMAdapter(ABC):
    provider: str

    @abstractmethod
    async def complete(
        self,
        messages: list[Message],
        model: str,
        tools: list[dict] | None = None,
        stream: bool = False,
    ) -> AsyncIterator[CompletionChunk]: ...

    @abstractmethod
    async def list_models(self) -> list[str]: ...


class OllamaAdapter(LLMAdapter):
    provider = "ollama"

    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL) -> None:
        self.base = base_url.rstrip("/")

    async def list_models(self) -> list[str]:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(f"{self.base}/api/tags")
            r.raise_for_status()
            return [m["name"] for m in r.json().get("models", [])]

    async def complete(self, messages, model, tools=None, stream=False):
        payload = {"model": model, "messages": [
            {"role": m.role, "content": m.content} for m in messages
        ], "stream": stream}
        if tools:
            payload["tools"] = tools
        async with httpx.AsyncClient(timeout=120) as c:
            if not stream:
                r = await c.post(f"{self.base}/api/chat", json=payload)
                r.raise_for_status()
                msg = r.json()["message"]
                yield CompletionChunk(delta=msg.get("content", ""), done=True)
                return
            async with c.stream("POST", f"{self.base}/api/chat", json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    data = json.loads(line)
                    if data.get("done"):
                        yield CompletionChunk(done=True)
                        return
                    delta = data.get("message", {}).get("content", "")
                    if delta:
                        yield CompletionChunk(delta=delta)


class OpenAIAdapter(LLMAdapter):
    provider = "openai"

    def __init__(self, api_key: str | None = settings.OPENAI_API_KEY, model: str = settings.OPENAI_MODEL) -> None:
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY not set")
        self.api_key = api_key
        self.model = model

    async def list_models(self) -> list[str]:
        return [self.model]

    async def complete(self, messages, model=None, tools=None, stream=False):
        model = model or self.model
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": stream,
        }
        if tools:
            payload["tools"] = [{"type": "function", "function": t} for t in tools]
        async with httpx.AsyncClient(timeout=120) as c:
            async with c.stream("POST", "https://api.openai.com/v1/chat/completions", json=payload, headers=headers) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    chunk = line[5:].strip()
                    if chunk == "[DONE]":
                        yield CompletionChunk(done=True)
                        return
                    data = json.loads(chunk)
                    choice = data["choices"][0]["delta"]
                    if "content" in choice and choice["content"]:
                        yield CompletionChunk(delta=choice["content"])


class AnthropicAdapter(LLMAdapter):
    provider = "anthropic"

    def __init__(self, api_key: str | None = settings.ANTHROPIC_API_KEY, model: str = settings.ANTHROPIC_MODEL) -> None:
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        self.api_key = api_key
        self.model = model

    async def list_models(self) -> list[str]:
        return [self.model]

    async def complete(self, messages, model=None, tools=None, stream=False):
        model = model or self.model
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        system = next((m.content for m in messages if m.role == "system"), "")
        conv = [{"role": m.role, "content": m.content} for m in messages if m.role != "system"]
        payload = {"model": model, "max_tokens": 1024, "system": system, "messages": conv, "stream": stream}
        async with httpx.AsyncClient(timeout=120) as c:
            async with c.stream("POST", "https://api.anthropic.com/v1/messages", json=payload, headers=headers) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = json.loads(line[5:].strip())
                    if data.get("type") == "content_block_delta" and data["delta"].get("text"):
                        yield CompletionChunk(delta=data["delta"]["text"])


def get_adapter(provider: str | None = None) -> LLMAdapter:
    provider = provider or settings.LLM_PROVIDER
    if provider == "openai":
        return OpenAIAdapter()
    if provider == "anthropic":
        return AnthropicAdapter()
    return OllamaAdapter()
