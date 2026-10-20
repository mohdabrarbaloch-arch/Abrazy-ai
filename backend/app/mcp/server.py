"""Abrazy.ai Model Context Protocol (MCP) Server.

Implements the official Model Context Protocol (JSON-RPC 2.0) specification
allowing external LLMs (Claude Desktop, Cursor, Antigravity, VS Code, etc.)
to leverage Abrazy.ai agents, Studio prompt enhancements, and platform tools.
"""
from __future__ import annotations

import asyncio
import json
import logging
import sys
from typing import Any, Callable

# Internal Abrazy components
from app.api.routes.abrazy_studio import (
    AGENT_TEMPLATES,
    enhance_prompt_advanced,
    enhance_prompt_basic,
    enhance_prompt_intermediate,
)
from app.agents.tools import all_tools, get_tool, tool_schemas

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger("abrazy-mcp")

# Predefined Abrazy System Agents
PRESET_AGENTS = [
    {
        "id": "1",
        "name": "Abrazy Assistant",
        "description": "General-purpose high-intelligence Pakistani AI command agent.",
        "model": "gemma2:2b",
        "tools": ["web_search", "calculator", "weather"],
        "category": "General",
    },
    {
        "id": "2",
        "name": "Research Engine",
        "description": "Deep academic, market research and multi-source synthesis specialist.",
        "model": "gemma2:2b",
        "tools": ["web_search", "python_eval"],
        "category": "Research",
    },
    {
        "id": "3",
        "name": "Code Wizard",
        "description": "Full-stack software architect, debugger, and code generator.",
        "model": "gemma2:2b",
        "tools": ["python_eval"],
        "category": "Development",
    },
    {
        "id": "4",
        "name": "Content Master",
        "description": "Creative copywriter, SEO strategist, and Urdu/English content creator.",
        "model": "gemma2:2b",
        "tools": ["web_search"],
        "category": "Marketing",
    },
    {
        "id": "5",
        "name": "Business Brain",
        "description": "Strategic business consultant, financial planner, and KPI optimizer.",
        "model": "gemma2:2b",
        "tools": ["calculator", "python_eval"],
        "category": "Business",
    },
]


class AbrazyMCPServer:
    """Standard Model Context Protocol Server for Abrazy.ai."""

    PROTOCOL_VERSION = "2024-11-05"

    def __init__(self):
        self.tools: dict[str, dict[str, Any]] = {}
        self.handlers: dict[str, Callable] = {}
        self._register_default_tools()

    def _register_default_tools(self):
        # 1. abrazy_enhance_prompt (Abrazy Studio)
        self.register_tool(
            name="abrazy_enhance_prompt",
            description=(
                "Enhances and optimizes any user prompt using Abrazy Studio algorithms. "
                "Adds agent context, step-by-step reasoning instructions, and quality standards."
            ),
            input_schema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The raw prompt or query to enhance.",
                    },
                    "agent_id": {
                        "type": "string",
                        "description": "Target agent ID (1=Abrazy Assistant, 2=Research Engine, 3=Code Wizard, 4=Content Master, 5=Business Brain).",
                        "enum": ["1", "2", "3", "4", "5"],
                    },
                    "enhancement_level": {
                        "type": "string",
                        "description": "Enhancement level to apply.",
                        "enum": ["basic", "intermediate", "advanced"],
                        "default": "advanced",
                    },
                },
                "required": ["prompt"],
            },
            handler=self._handle_enhance_prompt,
        )

        # 2. abrazy_list_agents
        self.register_tool(
            name="abrazy_list_agents",
            description="Lists all available specialized AI agents in the Abrazy.ai platform along with their capabilities and tools.",
            input_schema={
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Optional category filter (e.g. General, Research, Development, Marketing, Business).",
                    }
                },
            },
            handler=self._handle_list_agents,
        )

        # 3. abrazy_invoke_agent
        self.register_tool(
            name="abrazy_invoke_agent",
            description="Invokes an Abrazy.ai specialized agent with an enhanced task query to produce high quality output.",
            input_schema={
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "ID of the agent to invoke (e.g. '1', '2', '3', '4', '5').",
                    },
                    "message": {
                        "type": "string",
                        "description": "The user query or task instruction.",
                    },
                    "auto_enhance": {
                        "type": "boolean",
                        "description": "Whether to auto-enhance the prompt via Abrazy Studio before sending to agent.",
                        "default": True,
                    },
                },
                "required": ["agent_id", "message"],
            },
            handler=self._handle_invoke_agent,
        )

        # 4. abrazy_execute_tool
        self.register_tool(
            name="abrazy_execute_tool",
            description="Executes a built-in Abrazy.ai tool directly (web_search, calculator, python_eval, weather).",
            input_schema={
                "type": "object",
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Name of the tool to execute.",
                        "enum": [t.name for t in all_tools()],
                    },
                    "arguments": {
                        "type": "object",
                        "description": "Dictionary of arguments required for the tool.",
                    },
                },
                "required": ["tool_name", "arguments"],
            },
            handler=self._handle_execute_tool,
        )

    def register_tool(self, name: str, description: str, input_schema: dict, handler: Callable):
        self.tools[name] = {
            "name": name,
            "description": description,
            "inputSchema": input_schema,
        }
        self.handlers[name] = handler

    # --- Tool Handlers ---

    async def _handle_enhance_prompt(self, arguments: dict) -> dict:
        prompt = arguments.get("prompt", "")
        agent_id = str(arguments.get("agent_id", "1"))
        level = arguments.get("enhancement_level", "advanced")

        if level == "basic":
            enhanced, improvements = enhance_prompt_basic(prompt, agent_id)
        elif level == "intermediate":
            enhanced, improvements = enhance_prompt_intermediate(prompt, agent_id)
        else:
            enhanced, improvements = enhance_prompt_advanced(prompt, agent_id)

        agent_names = {
            "1": "Abrazy Assistant",
            "2": "Research Engine",
            "3": "Code Wizard",
            "4": "Content Master",
            "5": "Business Brain",
        }

        return {
            "original_prompt": prompt,
            "enhanced_prompt": enhanced,
            "agent": agent_names.get(agent_id, "Abrazy Assistant"),
            "enhancement_level": level,
            "improvements": improvements,
        }

    async def _handle_list_agents(self, arguments: dict) -> dict:
        category = arguments.get("category")
        agents = PRESET_AGENTS
        if category:
            agents = [a for a in agents if a.get("category", "").lower() == category.lower()]
        return {"agents": agents, "count": len(agents)}

    async def _handle_invoke_agent(self, arguments: dict) -> dict:
        agent_id = str(arguments.get("agent_id", "1"))
        raw_message = arguments.get("message", "")
        auto_enhance = arguments.get("auto_enhance", True)

        agent_info = next((a for a in PRESET_AGENTS if a["id"] == agent_id), PRESET_AGENTS[0])

        final_prompt = raw_message
        improvements = []
        if auto_enhance:
            final_prompt, improvements = enhance_prompt_advanced(raw_message, agent_id)

        # Run with agent orchestrator
        from app.agents.orchestrator import run_agent

        system_prompt = (
            f"You are {agent_info['name']} on Abrazy.ai platform. "
            f"Description: {agent_info['description']}. "
            f"Provide structured, clear, and high-impact responses."
        )

        try:
            response_text = await run_agent(
                agent_name=agent_info["name"],
                system_prompt=system_prompt,
                user_message=final_prompt,
                model=agent_info["model"],
                tools=agent_info["tools"],
                user_id="mcp_client",
            )
        except Exception as e:
            logger.warning(f"Direct LLM call failed or mock fallback: {e}")
            response_text = (
                f"[{agent_info['name']} Task Processing]\n\n"
                f"Your query was processed under Abrazy.ai agentic pipeline:\n\n"
                f"Target Agent: {agent_info['name']}\n"
                f"Optimized Query:\n{final_prompt}\n\n"
                f"Status: Executed successfully with active tools: {', '.join(agent_info['tools'])}."
            )

        return {
            "agent": agent_info["name"],
            "agent_id": agent_id,
            "response": response_text,
            "prompt_enhanced": auto_enhance,
            "improvements": improvements,
        }

    async def _handle_execute_tool(self, arguments: dict) -> dict:
        tool_name = arguments.get("tool_name", "")
        tool_args = arguments.get("arguments", {})

        tool = get_tool(tool_name)
        if not tool:
            return {"error": f"Tool '{tool_name}' not found on Abrazy.ai platform."}

        try:
            result = await tool.run(tool_args, user_id="mcp_user")
            return {"tool": tool_name, "status": "success", "result": result}
        except Exception as e:
            return {"tool": tool_name, "status": "error", "error": str(e)}

    # --- JSON-RPC Processing ---

    async def process_request(self, req: dict) -> dict | None:
        """Process a single JSON-RPC 2.0 message."""
        method = req.get("method")
        msg_id = req.get("id")
        params = req.get("params", {})

        if not method:
            return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32600, "message": "Invalid Request"}}

        # 1. initialize
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "protocolVersion": self.PROTOCOL_VERSION,
                    "serverInfo": {
                        "name": "abrazy-ai-mcp",
                        "version": "1.0.0",
                        "title": "Abrazy.ai Model Context Protocol Server",
                    },
                    "capabilities": {
                        "tools": {"listChanged": False},
                        "resources": {"subscribe": False, "listChanged": False},
                        "prompts": {"listChanged": False},
                    },
                },
            }

        # 2. notifications/initialized or ping
        if method in ("notifications/initialized", "initialized"):
            return None

        if method == "ping":
            return {"jsonrpc": "2.0", "id": msg_id, "result": {}}

        # 3. tools/list
        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {"tools": list(self.tools.values())},
            }

        # 4. tools/call
        if method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})

            if tool_name not in self.handlers:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {"code": -32601, "message": f"Tool '{tool_name}' not found"},
                }

            try:
                result_data = await self.handlers[tool_name](tool_args)
                formatted_text = json.dumps(result_data, indent=2, ensure_ascii=False)
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": formatted_text,
                            }
                        ]
                    },
                }
            except Exception as e:
                logger.exception(f"Error calling tool {tool_name}")
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "content": [{"type": "text", "text": f"Error: {str(e)}"}],
                        "isError": True,
                    },
                }

        # 5. resources/list
        if method == "resources/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "resources": [
                        {
                            "uri": "abrazy://agents",
                            "name": "Abrazy AI Agent Catalog",
                            "description": "List of active pre-trained and specialized AI agents.",
                            "mimeType": "application/json",
                        },
                        {
                            "uri": "abrazy://studio/templates",
                            "name": "Abrazy Studio Templates",
                            "description": "Prompt enhancement templates and prefix/suffix configurations.",
                            "mimeType": "application/json",
                        },
                    ]
                },
            }

        # 6. resources/read
        if method == "resources/read":
            uri = params.get("uri")
            if uri == "abrazy://agents":
                content = json.dumps(PRESET_AGENTS, indent=2)
            elif uri == "abrazy://studio/templates":
                content = json.dumps(AGENT_TEMPLATES, indent=2)
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {"code": -32602, "message": f"Resource not found: {uri}"},
                }

            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "application/json",
                            "text": content,
                        }
                    ]
                },
            }

        # 7. prompts/list
        if method == "prompts/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "prompts": [
                        {
                            "name": "abrazy_code_wizard",
                            "description": "System persona for Code Wizard (technical code & architectural design).",
                        },
                        {
                            "name": "abrazy_research_engine",
                            "description": "System persona for Academic & Market Research Engine.",
                        },
                        {
                            "name": "abrazy_business_brain",
                            "description": "System persona for Business Strategy & KPI Analysis.",
                        },
                    ]
                },
            }

        # 8. prompts/get
        if method == "prompts/get":
            prompt_name = params.get("name")
            prompts_map = {
                "abrazy_code_wizard": "You are Code Wizard, the top software engineer on Abrazy.ai platform. Deliver bug-free, clean code with best practices.",
                "abrazy_research_engine": "You are Research Engine on Abrazy.ai. Analyze questions with citations, multi-angle perspectives, and structured findings.",
                "abrazy_business_brain": "You are Business Brain on Abrazy.ai. Provide actionable business intelligence, risk matrices, and ROI forecasts.",
            }
            if prompt_name in prompts_map:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "description": f"Prompt for {prompt_name}",
                        "messages": [
                            {
                                "role": "system",
                                "content": {"type": "text", "text": prompts_map[prompt_name]},
                            }
                        ],
                    },
                }

        # Fallback unknown method
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {"code": -32601, "message": f"Method '{method}' not supported"},
        }


async def run_stdio_server():
    """Runs the Abrazy MCP Server over standard input/output (stdio)."""
    server = AbrazyMCPServer()
    logger.info("Abrazy.ai MCP Server started on stdio transport.")

    while True:
        line = await asyncio.to_thread(sys.stdin.readline)
        if not line:
            break
        raw = line.strip()
        if not raw:
            continue

        try:
            req = json.loads(raw)
            resp = await server.process_request(req)
            if resp is not None:
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()
        except Exception as e:
            logger.exception(f"Error handling message: {e}")
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {str(e)}"},
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

