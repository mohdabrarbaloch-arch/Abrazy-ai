"""Standalone executable for Abrazy.ai Model Context Protocol (MCP) Server.

Usage:
  python mcp_server.py
"""
import asyncio
import os
import sys

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.mcp.server import run_stdio_server

if __name__ == "__main__":
    try:
        asyncio.run(run_stdio_server())
    except KeyboardInterrupt:
        pass
