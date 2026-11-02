"""LLM provider adapters.

Ollama is the zero-key local default. OpenAI / Anthropic are env-gated adapters
so the same orchestrator works in production without code changes.
"""
from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, AsyncIterator

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
                raw_tcs = msg.get("tool_calls")
                if raw_tcs:
                    tool_calls = [
                        ToolCall(
                            id=tc.get("id", tc["function"]["name"]),
                            name=tc["function"]["name"],
                            arguments=(
                                tc["function"]["arguments"]
                                if isinstance(tc["function"]["arguments"], dict)
                                else json.loads(tc["function"]["arguments"])
                            ),
                        )
                        for tc in raw_tcs
                    ]
                    yield CompletionChunk(tool_calls=tool_calls)
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
                    msg = data.get("message", {})
                    raw_tcs = msg.get("tool_calls")
                    if raw_tcs:
                        tool_calls = [
                            ToolCall(
                                id=tc.get("id", tc["function"]["name"]),
                                name=tc["function"]["name"],
                                arguments=(
                                    tc["function"]["arguments"]
                                    if isinstance(tc["function"]["arguments"], dict)
                                    else json.loads(tc["function"]["arguments"])
                                ),
                            )
                            for tc in raw_tcs
                        ]
                        yield CompletionChunk(tool_calls=tool_calls)
                    delta = msg.get("content", "")
                    if delta:
                        yield CompletionChunk(delta=delta)


class OpenAIAdapter(LLMAdapter):
    provider = "openai"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        key = api_key if api_key is not None else settings.OPENAI_API_KEY
        if not key:
            raise RuntimeError("OPENAI_API_KEY not set")
        self.api_key = key
        self.model = model or settings.OPENAI_MODEL

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
                # Accumulate tool call deltas across streaming chunks
                # Structure: {index: {"id": str, "name": str, "arguments": str}}
                tc_accum: dict[int, dict] = {}
                finish_reason = None
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    chunk = line[5:].strip()
                    if chunk == "[DONE]":
                        # Yield accumulated tool calls if any
                        if tc_accum or finish_reason == "tool_calls":
                            tool_calls = [
                                ToolCall(
                                    id=tc.get("id", ""),
                                    name=tc.get("name", ""),
                                    arguments=json.loads(tc.get("arguments", "{}") or "{}"),
                                )
                                for tc in tc_accum.values()
                            ]
                            if tool_calls:
                                yield CompletionChunk(tool_calls=tool_calls)
                        yield CompletionChunk(done=True)
                        return
                    data = json.loads(chunk)
                    choice = data["choices"][0]
                    finish_reason = choice.get("finish_reason") or finish_reason
                    delta = choice["delta"]
                    # Accumulate tool call argument deltas
                    for tc_delta in delta.get("tool_calls", []):
                        idx = tc_delta["index"]
                        if idx not in tc_accum:
                            tc_accum[idx] = {"id": "", "name": "", "arguments": ""}
                        if tc_delta.get("id"):
                            tc_accum[idx]["id"] = tc_delta["id"]
                        fn = tc_delta.get("function", {})
                        if fn.get("name"):
                            tc_accum[idx]["name"] += fn["name"]
                        if fn.get("arguments"):
                            tc_accum[idx]["arguments"] += fn["arguments"]
                    if "content" in delta and delta["content"]:
                        yield CompletionChunk(delta=delta["content"])


class AnthropicAdapter(LLMAdapter):
    provider = "anthropic"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        key = api_key if api_key is not None else settings.ANTHROPIC_API_KEY
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        self.api_key = key
        self.model = model or settings.ANTHROPIC_MODEL

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
        if tools:
            payload["tools"] = [
                {
                    "name": t["name"],
                    "description": t.get("description", ""),
                    "input_schema": t.get("parameters", {"type": "object", "properties": {}}),
                }
                for t in tools
            ]
        async with httpx.AsyncClient(timeout=120) as c:
            async with c.stream("POST", "https://api.anthropic.com/v1/messages", json=payload, headers=headers) as resp:
                resp.raise_for_status()
                # Accumulate tool use blocks
                current_tool_id = ""
                current_tool_name = ""
                current_tool_args = ""
                in_tool_block = False
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = json.loads(line[5:].strip())
                    event_type = data.get("type", "")
                    if event_type == "content_block_start":
                        cb = data.get("content_block", {})
                        if cb.get("type") == "tool_use":
                            in_tool_block = True
                            current_tool_id = cb.get("id", "")
                            current_tool_name = cb.get("name", "")
                            current_tool_args = ""
                    elif event_type == "content_block_delta":
                        delta = data.get("delta", {})
                        if delta.get("type") == "input_json_delta":
                            current_tool_args += delta.get("partial_json", "")
                        elif delta.get("type") == "text_delta" and delta.get("text"):
                            yield CompletionChunk(delta=delta["text"])
                    elif event_type == "message_delta":
                        stop_reason = data.get("delta", {}).get("stop_reason")
                        if stop_reason == "tool_use" and in_tool_block:
                            try:
                                args = json.loads(current_tool_args) if current_tool_args else {}
                            except json.JSONDecodeError:
                                args = {}
                            yield CompletionChunk(
                                tool_calls=[ToolCall(id=current_tool_id, name=current_tool_name, arguments=args)]
                            )
                            in_tool_block = False


class GroqAdapter(LLMAdapter):
    provider = "groq"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        key = api_key if api_key is not None else settings.GROQ_API_KEY
        if not key:
            raise RuntimeError("GROQ_API_KEY not set")
        self.api_key = key
        self.model = model or settings.GROQ_MODEL or "openai/gpt-oss-120b"

    async def list_models(self) -> list[str]:
        return ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b", "allam-2-7b"]

    async def complete(self, messages, model=None, tools=None, stream=False):
        requested_model = model or self.model
        # Robust candidate chain: requested -> primary -> fallbacks
        candidates: list[str] = []
        for m in [requested_model, self.model, "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]:
            if m and m not in candidates:
                candidates.append(m)

        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        last_error = None

        for candidate_model in candidates:
            payload = {
                "model": candidate_model,
                "messages": [{"role": m.role, "content": m.content} for m in messages],
                "stream": stream,
            }
            if tools:
                payload["tools"] = [{"type": "function", "function": t} for t in tools]

            try:
                async with httpx.AsyncClient(timeout=120) as c:
                    if not stream:
                        resp = await c.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
                        if resp.status_code in (400, 404) and "model" in resp.text.lower():
                            last_error = resp.text
                            continue  # Try fallback model
                        resp.raise_for_status()
                        data = resp.json()
                        msg = data["choices"][0]["message"]
                        raw_tcs = msg.get("tool_calls")
                        if raw_tcs:
                            tool_calls = [
                                ToolCall(
                                    id=tc["id"],
                                    name=tc["function"]["name"],
                                    arguments=json.loads(tc["function"]["arguments"]),
                                )
                                for tc in raw_tcs
                            ]
                            yield CompletionChunk(tool_calls=tool_calls)
                        content = msg.get("content", "")
                        yield CompletionChunk(delta=content, done=True)
                        return

                    async with c.stream("POST", "https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers) as resp:
                        if resp.status_code in (400, 404):
                            err_body = await resp.aread()
                            if b"model" in err_body.lower():
                                last_error = err_body.decode()
                                continue  # Try fallback model
                        resp.raise_for_status()
                        tc_accum: dict[int, dict] = {}
                        finish_reason = None
                        async for line in resp.aiter_lines():
                            if not line.startswith("data:"):
                                continue
                            chunk = line[5:].strip()
                            if chunk == "[DONE]":
                                if tc_accum or finish_reason == "tool_calls":
                                    tool_calls = [
                                        ToolCall(
                                            id=tc.get("id", ""),
                                            name=tc.get("name", ""),
                                            arguments=json.loads(tc.get("arguments", "{}") or "{}"),
                                        )
                                        for tc in tc_accum.values()
                                    ]
                                    if tool_calls:
                                        yield CompletionChunk(tool_calls=tool_calls)
                                yield CompletionChunk(done=True)
                                return
                            data = json.loads(chunk)
                            choices = data.get("choices", [])
                            if not choices:
                                continue
                            choice = choices[0]
                            finish_reason = choice.get("finish_reason") or finish_reason
                            delta = choice.get("delta", {})
                            for tc_delta in delta.get("tool_calls", []):
                                idx = tc_delta["index"]
                                if idx not in tc_accum:
                                    tc_accum[idx] = {"id": "", "name": "", "arguments": ""}
                                if tc_delta.get("id"):
                                    tc_accum[idx]["id"] = tc_delta["id"]
                                fn = tc_delta.get("function", {})
                                if fn.get("name"):
                                    tc_accum[idx]["name"] += fn["name"]
                                if fn.get("arguments"):
                                    tc_accum[idx]["arguments"] += fn["arguments"]
                            if "content" in delta and delta["content"]:
                                yield CompletionChunk(delta=delta["content"])
                        return  # Successfully finished streaming
            except Exception as e:
                last_error = e
                continue

        if last_error:
            raise RuntimeError(f"All Groq models failed. Last error: {last_error}")


class GeminiAdapter(LLMAdapter):
    provider = "gemini"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        key = api_key if api_key is not None else settings.GEMINI_API_KEY
        if not key:
            raise RuntimeError("GEMINI_API_KEY not set")
        self.api_key = key
        self.model = model or settings.GEMINI_MODEL or "gemini-2.5-flash"

    async def list_models(self) -> list[str]:
        return ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]

    async def complete(self, messages, model=None, tools=None, stream=False):
        model = model or self.model
        system_instruction = None
        contents = []

        for m in messages:
            if m.role == "system":
                system_instruction = {"parts": [{"text": m.content}]}
            else:
                role = "model" if m.role in {"assistant", "agent"} else "user"
                contents.append({"role": role, "parts": [{"text": m.content}]})

        payload: dict[str, Any] = {"contents": contents}
        if system_instruction:
            payload["system_instruction"] = system_instruction
        if tools:
            payload["tools"] = [{"function_declarations": tools}]

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={self.api_key}"

        async with httpx.AsyncClient(timeout=120) as c:
            async with c.stream("POST", url, json=payload, headers={"Content-Type": "application/json"}) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    chunk_str = line[5:].strip()
                    if not chunk_str:
                        continue
                    try:
                        data = json.loads(chunk_str)
                        candidates = data.get("candidates", [])
                        if candidates:
                            content = candidates[0].get("content", {})
                            parts = content.get("parts", [])
                            for part in parts:
                                fc = part.get("functionCall")
                                if fc:
                                    yield CompletionChunk(
                                        tool_calls=[
                                            ToolCall(
                                                id=fc.get("name", ""),
                                                name=fc["name"],
                                                arguments=fc.get("args", {}),
                                            )
                                        ]
                                    )
                                elif "text" in part and part["text"]:
                                    yield CompletionChunk(delta=part["text"])
                    except Exception:
                        continue

        yield CompletionChunk(done=True)


def get_adapter(
    provider: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
) -> LLMAdapter:
    """Dynamically route to the best available LLM provider based on key, model, or configuration."""
    # 1. Infer provider from API key prefix if key was passed directly
    if api_key:
        if api_key.startswith("gsk_"):
            provider = "groq"
        elif api_key.startswith("AIza"):
            provider = "gemini"
        elif api_key.startswith("sk-ant-"):
            provider = "anthropic"
        elif api_key.startswith("sk-") and not api_key.startswith("sk-ant-"):
            provider = "openai"

    # 2. Infer provider from model name if provider not explicitly set
    if not provider and model:
        m_lower = model.lower()
        if any(g in m_lower for g in ["llama", "mixtral", "groq"]):
            if api_key or settings.GROQ_API_KEY:
                provider = "groq"
        elif "gemini" in m_lower:
            if api_key or settings.GEMINI_API_KEY:
                provider = "gemini"
        elif "claude" in m_lower:
            if api_key or settings.ANTHROPIC_API_KEY:
                provider = "anthropic"
        elif any(o in m_lower for o in ["gpt", "o1", "o3"]):
            if api_key or (settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-your-")):
                provider = "openai"

    # 3. Default provider from settings
    provider = provider or settings.LLM_PROVIDER

    # 4. Attempt chosen provider, fallback gracefully
    if provider == "groq":
        try:
            return GroqAdapter(api_key=api_key, model=model)
        except Exception:
            pass

    if provider == "gemini":
        try:
            return GeminiAdapter(api_key=api_key, model=model)
        except Exception:
            pass

    if provider == "openai":
        try:
            return OpenAIAdapter(api_key=api_key, model=model)
        except Exception:
            pass

    if provider == "anthropic":
        try:
            return AnthropicAdapter(api_key=api_key, model=model)
        except Exception:
            pass

    # 5. Check if Groq or Gemini are configured as free cloud fallback
    if settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk_your-"):
        try:
            return GroqAdapter(model=model)
        except Exception:
            pass

    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("AIza_your-"):
        try:
            return GeminiAdapter(model=model)
        except Exception:
            pass

    # 6. Local-first default: Ollama
    return OllamaAdapter()

