"""Agent orchestrator: reasoning + tool-calling loop with MCP client support.

Drives a single agent run:
  1. Build system + user messages.
  2. Load tools from internal registry + external MCP servers (Composio, custom).
  3. Call the LLM (streaming) with combined tool schemas.
  4. If the model emits a tool call, route to internal or external MCP tool.
  5. Feed result back and continue until the model finishes.
  6. Yield status events so the WebSocket layer can push live updates.

The loop is bounded (max_tool_rounds) to prevent runaway execution.
"""
from __future__ import annotations

import json
import logging
from typing import AsyncIterator, Callable

from app.agents.llm import CompletionChunk, Message, get_adapter
from app.agents.tools import get_tool, tool_schemas
from app.core.config import settings
from app.mcp.client import get_mcp_client

logger = logging.getLogger(__name__)

StatusEvent = dict  # {"type": "status"|"token"|"tool"|"done"|"error", ...}


async def run_agent(
    *,
    agent_name: str,
    system_prompt: str,
    user_message: str,
    model: str,
    tools: list[str],
    user_id: str,
    db=None,
    provider: str | None = None,
    on_event: Callable[[StatusEvent], None] | None = None,
    max_tool_rounds: int = 5,
    enable_external_tools: bool = True,
    external_tool_filters: list[str] | None = None,
) -> str:
    """
    Run an agent with tool calling support.

    Args:
        enable_external_tools: Whether to load tools from MCP client (Composio, custom servers)
        external_tool_filters: Optional list of tool name prefixes to filter (e.g., ["composio.instagram", "abrazy"])
    """
    adapter = get_adapter(provider)
    messages: list[Message] = [
        Message(role="system", content=system_prompt or "You are a helpful AI agent."),
        Message(role="user", content=user_message),
    ]

    # Combine internal and external tool schemas
    schemas = []

    # 1. Internal tools (from app.agents.tools)
    if tools:
        internal_schemas = tool_schemas(tools)
        if internal_schemas:
            schemas.extend(internal_schemas)
            logger.info(f"✅ Loaded {len(internal_schemas)} internal tools")

    # 2. External MCP tools (Composio, custom servers)
    mcp_tools = []
    if enable_external_tools:
        try:
            mcp_client = await get_mcp_client()
            all_mcp_tools = await mcp_client.list_tools()

            # Apply filters if provided
            if external_tool_filters:
                mcp_tools = [
                    t
                    for t in all_mcp_tools
                    if any(t["name"].startswith(prefix) for prefix in external_tool_filters)
                ]
            else:
                mcp_tools = all_mcp_tools

            # Convert MCP tool schemas to LLM format
            for tool in mcp_tools:
                schemas.append(
                    {
                        "name": tool["name"],
                        "description": tool["description"],
                        "parameters": tool["inputSchema"],
                    }
                )

            logger.info(f"✅ Loaded {len(mcp_tools)} external MCP tools")

        except Exception as e:
            logger.warning(f"⚠️ Failed to load MCP tools: {e}")

    final_text = ""

    def emit(ev: StatusEvent) -> None:
        if on_event:
            on_event(ev)

    emit(
        {
            "type": "status",
            "state": "planning",
            "message": f"{agent_name} is thinking... ({len(schemas)} tools available)",
        }
    )

    for round_num in range(max_tool_rounds + 1):
        buf = ""
        pending_tool_calls: list = []  # collect ToolCall objects from chunks

        async for chunk in adapter.complete(messages, model=model, tools=schemas if schemas else None, stream=True):
            if chunk.tool_calls:
                pending_tool_calls.extend(chunk.tool_calls)
            if chunk.delta:
                buf += chunk.delta
                final_text = buf
                emit({"type": "token", "delta": chunk.delta})

        if pending_tool_calls:
            # Execute each tool call
            for tc in pending_tool_calls:
                tool_name = tc.name
                tool_args = tc.arguments if isinstance(tc.arguments, dict) else {}

                emit({
                    "type": "tool_start",
                    "name": tool_name,
                    "args": tool_args,
                    "round": round_num + 1,
                })

                try:
                    result = await _execute_tool(
                        tool_name=tool_name,
                        arguments=tool_args,
                        user_id=user_id,
                        db=db,
                        mcp_tool_names=[t["name"] for t in mcp_tools],
                    )
                    emit({"type": "tool_done", "name": tool_name, "result": result})

                    # Feed result back as tool role message (OpenAI tool message format)
                    messages.append(Message(role="assistant", content=buf or ""))
                    messages.append(Message(
                        role="tool",
                        content=json.dumps(result, ensure_ascii=False),
                        tool_call_id=tc.id,
                    ))
                except Exception as e:
                    error_msg = f"Tool execution failed: {str(e)}"
                    logger.exception(f"❌ {error_msg}")
                    emit({"type": "error", "message": error_msg})
                    messages.append(
                        Message(
                            role="user",
                            content=f"Tool '{tool_name}' failed: {str(e)}. Please try a different approach or inform the user.",
                        )
                    )
            continue  # next round with tool results injected

        # No tool calls — model is done
        emit({"type": "done", "message": final_text})
        return final_text

    emit({"type": "done", "message": final_text})
    return final_text


async def _execute_tool(
    tool_name: str,
    arguments: dict,
    user_id: str,
    db,
    mcp_tool_names: list[str],
) -> dict | str:
    """
    Execute a tool - either internal or via MCP client.

    Args:
        tool_name: Name of tool to execute
        arguments: Tool arguments
        user_id: User ID for context
        db: Database session
        mcp_tool_names: List of available MCP tool names

    Returns:
        Tool execution result
    """
    # Check if this is an MCP tool
    if tool_name in mcp_tool_names:
        logger.info(f"🔌 Executing external MCP tool: {tool_name}")
        mcp_client = await get_mcp_client()
        result = await mcp_client.call_tool(tool_name, arguments)
        return result

    # Try internal tool
    tool = get_tool(tool_name)
    if tool:
        logger.info(f"🔧 Executing internal tool: {tool_name}")
        result = await tool.run(arguments, user_id=user_id, db=db)
        return result

    # Tool not found
    logger.error(f"❌ Tool not found: {tool_name}")
    return {"error": f"Tool '{tool_name}' not found"}


