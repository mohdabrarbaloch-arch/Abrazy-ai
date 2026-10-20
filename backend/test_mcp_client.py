"""Test script for Abrazy MCP Client.

Usage:
    python backend/test_mcp_client.py
"""
import asyncio
import logging
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.mcp.client import AbrazyMCPClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_local_server():
    """Test 1: Connect to local Abrazy MCP server."""
    print("\n" + "=" * 60)
    print("TEST 1: Connect to Local Abrazy MCP Server")
    print("=" * 60)

    client = AbrazyMCPClient()

    # Connect to local server
    success = await client.connect_local_server(
        server_name="abrazy",
        command="python",
        args=["backend/mcp_server.py"],
        env={"PYTHONPATH": "backend", "LLM_PROVIDER": "ollama"},
    )

    if not success:
        print("❌ Failed to connect to local server")
        return False

    print("✅ Connected to local server")

    # List tools
    tools = await client.list_tools()
    print(f"\n✅ Available tools: {len(tools)}")
    for tool in tools:
        print(f"  - {tool['name']}: {tool['description'][:80]}...")

    return True


async def test_tool_call():
    """Test 2: Call a tool."""
    print("\n" + "=" * 60)
    print("TEST 2: Call abrazy.abrazy_list_agents Tool")
    print("=" * 60)

    client = AbrazyMCPClient()

    # Connect
    await client.connect_local_server(
        server_name="abrazy",
        command="python",
        args=["backend/mcp_server.py"],
        env={"PYTHONPATH": "backend"},
    )

    # Call tool
    try:
        result = await client.call_tool("abrazy.abrazy_list_agents", {})
        print("\n✅ Tool call successful!")
        print(f"Response: {result}")

        if "agents" in result:
            print(f"\n✅ Found {result['count']} agents:")
            for agent in result["agents"]:
                print(f"  - {agent['name']}: {agent['description']}")
        return True

    except Exception as e:
        print(f"❌ Tool call failed: {e}")
        return False


async def test_composio_init():
    """Test 3: Check Composio initialization."""
    print("\n" + "=" * 60)
    print("TEST 3: Check Composio Integration")
    print("=" * 60)

    client = AbrazyMCPClient()

    if client.composio_client:
        print("✅ Composio client initialized")
        try:
            count = await client.connect_composio_tools(apps=["instagram"])
            print(f"✅ Loaded {count} Composio tools")
            return True
        except Exception as e:
            print(f"⚠️ Composio tools loading failed: {e}")
            return False
    else:
        print("ℹ️ Composio not configured (no COMPOSIO_API_KEY)")
        print("   To enable: Set COMPOSIO_API_KEY environment variable")
        return True


async def test_tool_schema():
    """Test 4: Get tool schema."""
    print("\n" + "=" * 60)
    print("TEST 4: Get Tool Schema")
    print("=" * 60)

    client = AbrazyMCPClient()

    await client.connect_local_server(
        server_name="abrazy",
        command="python",
        args=["backend/mcp_server.py"],
        env={"PYTHONPATH": "backend"},
    )

    schema = await client.get_tool_schema("abrazy.abrazy_enhance_prompt")
    if schema:
        print("✅ Retrieved tool schema:")
        print(f"   Type: {schema.get('type')}")
        print(f"   Properties: {list(schema.get('properties', {}).keys())}")
        return True
    else:
        print("❌ Failed to get tool schema")
        return False


async def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("🧪 ABRAZY MCP CLIENT TEST SUITE")
    print("=" * 60)

    results = []

    # Test 1: Local server connection
    try:
        results.append(("Local Server Connection", await test_local_server()))
    except Exception as e:
        logger.exception("Test 1 failed")
        results.append(("Local Server Connection", False))

    # Test 2: Tool call
    try:
        results.append(("Tool Call Execution", await test_tool_call()))
    except Exception as e:
        logger.exception("Test 2 failed")
        results.append(("Tool Call Execution", False))

    # Test 3: Composio
    try:
        results.append(("Composio Integration", await test_composio_init()))
    except Exception as e:
        logger.exception("Test 3 failed")
        results.append(("Composio Integration", False))

    # Test 4: Tool schema
    try:
        results.append(("Tool Schema Retrieval", await test_tool_schema()))
    except Exception as e:
        logger.exception("Test 4 failed")
        results.append(("Tool Schema Retrieval", False))

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {test_name}")

    print("\n" + "=" * 60)
    print(f"FINAL SCORE: {passed}/{total} tests passed")
    print("=" * 60)

    return passed == total


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.exception("Test suite failed")
        sys.exit(1)
