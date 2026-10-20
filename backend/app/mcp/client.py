"""Abrazy.ai MCP Client - Connect to external MCP servers and Composio tools.

This client allows Abrazy agents to dynamically discover and execute tools from:
1. Local MCP servers (via STDIO subprocess)
2. Composio platform (via API key)
3. Custom external MCP servers

Usage:
    client = AbrazyMCPClient()
    await client.connect_local_server("python", ["mcp_server.py"])
    tools = await client.list_tools()
    result = await client.call_tool("instagram_create_post", {...})
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import subprocess
from typing import Any

logger = logging.getLogger(__name__)


class AbrazyMCPClient:
    """Client to connect to external MCP servers and Composio tools."""

    def __init__(self):
        self.processes: dict[str, asyncio.subprocess.Process] = {}
        self.tools_cache: dict[str, dict] = {}
        self.composio_client = None
        self._initialize_composio()

    def _initialize_composio(self):
        """Initialize Composio client if API key is available."""
        composio_key = os.getenv("COMPOSIO_API_KEY")
        if composio_key:
            try:
                from composio import Composio
                self.composio_client = Composio(api_key=composio_key)
                logger.info("✅ Composio client initialized")
            except ImportError:
                logger.warning("⚠️ composio-core not installed. Install with: pip install composio-core")
            except Exception as e:
                logger.warning(f"⚠️ Composio initialization failed: {e}")
        else:
            logger.info("ℹ️ No COMPOSIO_API_KEY found - using local MCP servers only")

    async def connect_local_server(
        self,
        server_name: str,
        command: str,
        args: list[str],
        env: dict[str, str] | None = None,
    ) -> bool:
        """
        Connect to a local MCP server via STDIO subprocess.

        Args:
            server_name: Unique identifier for this server connection
            command: Command to execute (e.g., "python", "node")
            args: Arguments list (e.g., ["backend/mcp_server.py"])
            env: Optional environment variables

        Returns:
            True if connection successful, False otherwise
        """
        try:
            # Merge environment variables
            full_env = os.environ.copy()
            if env:
                full_env.update(env)

            # Start subprocess (Windows-compatible using shell=True for Python)
            import platform
            if platform.system() == "Windows" and command in ("python", "python3"):
                # Windows: Use shell to properly resolve python
                cmd_str = f"{command} {' '.join(args)}"
                process = await asyncio.create_subprocess_shell(
                    cmd_str,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=full_env,
                )
            else:
                # Unix/Linux: Use exec
                process = await asyncio.create_subprocess_exec(
                    command,
                    *args,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=full_env,
                )

            self.processes[server_name] = process
            logger.info(f"✅ Started MCP server: {server_name}")

            # Initialize handshake
            init_response = await self._send_request(
                server_name,
                "initialize",
                {
                    "protocolVersion": "2024-11-05",
                    "clientInfo": {"name": "abrazy-ai-client", "version": "1.0.0"},
                },
            )

            if "error" in init_response:
                logger.error(f"❌ Initialize failed for {server_name}: {init_response['error']}")
                return False

            logger.info(f"✅ Initialized {server_name}: {init_response.get('result', {}).get('serverInfo', {})}")

            # Send initialized notification
            await self._send_notification(server_name, "notifications/initialized", {})

            # Fetch available tools
            tools_response = await self._send_request(server_name, "tools/list", {})

            if "result" in tools_response:
                tools = tools_response["result"].get("tools", [])
                for tool in tools:
                    # Prefix tool name with server name to avoid collisions
                    full_tool_name = f"{server_name}.{tool['name']}"
                    self.tools_cache[full_tool_name] = {
                        **tool,
                        "_server": server_name,
                        "_original_name": tool["name"],
                    }
                logger.info(f"✅ Loaded {len(tools)} tools from {server_name}")
            else:
                logger.warning(f"⚠️ No tools returned from {server_name}")

            return True

        except FileNotFoundError:
            logger.error(f"❌ Command not found: {command}")
            return False
        except Exception as e:
            logger.exception(f"❌ Failed to connect to {server_name}: {e}")
            return False

    async def connect_composio_tools(self, apps: list[str] | None = None) -> int:
        """
        Load tools from Composio platform.

        Args:
            apps: Optional list of app names (e.g., ["instagram", "gmail"])
                  If None, loads all available apps.

        Returns:
            Number of tools loaded
        """
        if not self.composio_client:
            logger.warning("⚠️ Composio client not initialized - skipping")
            return 0

        try:
            # Fetch tools from Composio
            if apps:
                tools = self.composio_client.get_tools(apps=apps)
            else:
                tools = self.composio_client.get_tools()

            # Cache tools with composio prefix
            tool_count = 0
            for tool in tools:
                tool_name = f"composio.{tool.name.lower()}"
                self.tools_cache[tool_name] = {
                    "name": tool.name,
                    "description": tool.description or "Composio tool",
                    "inputSchema": tool.parameters or {"type": "object", "properties": {}},
                    "_source": "composio",
                    "_tool_obj": tool,
                }
                tool_count += 1

            logger.info(f"✅ Loaded {tool_count} tools from Composio")
            return tool_count

        except Exception as e:
            logger.exception(f"❌ Failed to load Composio tools: {e}")
            return 0

    async def list_tools(self, source_filter: str | None = None) -> list[dict]:
        """
        List all available tools from all connected sources.

        Args:
            source_filter: Optional filter - "local", "composio", or server name

        Returns:
            List of tool schemas
        """
        tools = []
        for tool_name, tool_data in self.tools_cache.items():
            # Apply filter if provided
            if source_filter:
                if source_filter == "composio" and not tool_name.startswith("composio."):
                    continue
                elif source_filter == "local" and not tool_data.get("_server"):
                    continue
                elif source_filter not in ("composio", "local"):
                    # Filter by specific server name
                    if tool_data.get("_server") != source_filter:
                        continue

            tools.append(
                {
                    "name": tool_name,
                    "description": tool_data.get("description", ""),
                    "inputSchema": tool_data.get("inputSchema", {}),
                    "source": tool_data.get("_source", tool_data.get("_server", "unknown")),
                }
            )

        return tools

    async def call_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """
        Execute a tool by name with given arguments.

        Args:
            tool_name: Full tool name (e.g., "abrazy.abrazy_enhance_prompt" or "composio.instagram_create_post")
            arguments: Dictionary of tool arguments

        Returns:
            Tool execution result

        Raises:
            ValueError: If tool not found
            RuntimeError: If tool execution fails
        """
        tool_data = self.tools_cache.get(tool_name)
        if not tool_data:
            raise ValueError(f"Tool '{tool_name}' not found in cache. Available: {list(self.tools_cache.keys())}")

        # Route to appropriate handler
        if tool_data.get("_source") == "composio":
            return await self._call_composio_tool(tool_data, arguments)
        elif tool_data.get("_server"):
            return await self._call_local_tool(tool_data, arguments)
        else:
            raise ValueError(f"Unknown tool source for '{tool_name}'")

    async def _call_local_tool(self, tool_data: dict, arguments: dict) -> dict[str, Any]:
        """Execute tool on local MCP server via STDIO."""
        server_name = tool_data["_server"]
        original_name = tool_data["_original_name"]

        try:
            response = await self._send_request(
                server_name,
                "tools/call",
                {"name": original_name, "arguments": arguments},
            )

            if "error" in response:
                error_msg = response["error"].get("message", "Unknown error")
                logger.error(f"❌ Tool call failed: {error_msg}")
                return {"error": error_msg, "status": "failed"}

            # Extract content from MCP response format
            result = response.get("result", {})
            content = result.get("content", [])

            if content and isinstance(content, list):
                # Parse first text content item
                text_content = content[0].get("text", "{}")
                try:
                    return json.loads(text_content)
                except json.JSONDecodeError:
                    return {"result": text_content}

            return result

        except Exception as e:
            logger.exception(f"❌ Local tool execution failed: {e}")
            return {"error": str(e), "status": "failed"}

    async def _call_composio_tool(self, tool_data: dict, arguments: dict) -> dict[str, Any]:
        """Execute tool via Composio API."""
        try:
            tool_obj = tool_data["_tool_obj"]
            result = self.composio_client.execute_action(
                action=tool_obj.name,
                params=arguments,
            )
            return {"result": result, "status": "success"}

        except Exception as e:
            logger.exception(f"❌ Composio tool execution failed: {e}")
            return {"error": str(e), "status": "failed"}

    async def _send_request(self, server_name: str, method: str, params: dict) -> dict:
        """Send JSON-RPC request to MCP server and wait for response."""
        process = self.processes.get(server_name)
        if not process:
            raise RuntimeError(f"Server '{server_name}' not connected")

        request = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}

        # Send request
        request_line = json.dumps(request) + "\n"
        process.stdin.write(request_line.encode())
        await process.stdin.drain()

        # Read response
        response_line = await process.stdout.readline()
        if not response_line:
            raise RuntimeError(f"Server '{server_name}' closed connection")

        return json.loads(response_line.decode())

    async def _send_notification(self, server_name: str, method: str, params: dict):
        """Send JSON-RPC notification (no response expected)."""
        process = self.processes.get(server_name)
        if not process:
            return

        notification = {"jsonrpc": "2.0", "method": method, "params": params}
        notification_line = json.dumps(notification) + "\n"
        process.stdin.write(notification_line.encode())
        await process.stdin.drain()

    async def disconnect_all(self):
        """Disconnect all MCP servers and cleanup."""
        for server_name, process in self.processes.items():
            try:
                process.terminate()
                await process.wait()
                logger.info(f"✅ Disconnected {server_name}")
            except Exception as e:
                logger.warning(f"⚠️ Error disconnecting {server_name}: {e}")

        self.processes.clear()
        self.tools_cache.clear()

    async def get_tool_schema(self, tool_name: str) -> dict | None:
        """Get the input schema for a specific tool."""
        tool_data = self.tools_cache.get(tool_name)
        if tool_data:
            return tool_data.get("inputSchema")
        return None

    def get_tools_for_provider(self, provider: str) -> list[dict]:
        """
        Get all tools for a specific provider (e.g., "instagram", "gmail").

        Args:
            provider: Provider name

        Returns:
            List of tool schemas for that provider
        """
        tools = []
        prefix = f"composio.{provider}_"

        for tool_name, tool_data in self.tools_cache.items():
            if tool_name.startswith(prefix):
                tools.append(
                    {
                        "name": tool_name,
                        "display_name": tool_data.get("name", tool_name),
                        "description": tool_data.get("description", ""),
                        "inputSchema": tool_data.get("inputSchema", {}),
                    }
                )

        return tools


# Global singleton instance
_global_client: AbrazyMCPClient | None = None


async def get_mcp_client() -> AbrazyMCPClient:
    """Get or create global MCP client instance."""
    global _global_client
    if _global_client is None:
        _global_client = AbrazyMCPClient()

        # Auto-connect to local Abrazy MCP server (skip on Windows if subprocess fails)
        try:
            import platform
            if platform.system() == "Windows":
                logger.warning("⚠️ MCP subprocess not supported on Windows asyncio - using API-only mode")
            else:
                await _global_client.connect_local_server(
                    server_name="abrazy",
                    command="python",
                    args=["backend/mcp_server.py"],
                    env={"PYTHONPATH": "backend", "LLM_PROVIDER": "ollama"},
                )
        except Exception as e:
            logger.warning(f"⚠️ Could not auto-connect to Abrazy MCP server: {e}")

        # Auto-load Composio tools if available
        try:
            await _global_client.connect_composio_tools()
        except Exception as e:
            logger.warning(f"⚠️ Could not load Composio tools: {e}")

    return _global_client


async def shutdown_mcp_client():
    """Shutdown global MCP client."""
    global _global_client
    if _global_client:
        await _global_client.disconnect_all()
        _global_client = None
