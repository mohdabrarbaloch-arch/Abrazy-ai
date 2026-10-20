# 🔌 Abrazy.ai Model Context Protocol (MCP) Server

**Abrazy.ai MCP Server** allows external AI clients like **Claude Desktop**, **Cursor**, **Antigravity IDE**, and **VS Code MCP Extensions** to directly interact with Abrazy.ai's agents, Studio prompt enhancer, and tools!

---

## 🌟 Available MCP Tools

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `abrazy_enhance_prompt` | Enhances prompts using **Abrazy Studio** (adds agent context, step-by-step reasoning, and quality standards). | `prompt`, `agent_id` (`1`..`5`), `enhancement_level` (`basic`, `intermediate`, `advanced`) |
| `abrazy_list_agents` | Lists all active specialized agents (Abrazy Assistant, Research Engine, Code Wizard, Content Master, Business Brain). | `category` (optional) |
| `abrazy_invoke_agent` | Runs autonomous task execution with an Abrazy agent. | `agent_id`, `message`, `auto_enhance` |
| `abrazy_execute_tool` | Executes platform tools directly (`web_search`, `calculator`, `python_eval`, `weather`). | `tool_name`, `arguments` |

---

## 🗂️ Available MCP Resources

- `abrazy://agents` : Live JSON catalog of active agents and tool capabilities.
- `abrazy://studio/templates` : Active prompt enhancement templates.

---

## 💬 Available MCP Prompts

- `abrazy_code_wizard` : High-tier software engineer & architect persona.
- `abrazy_research_engine` : Deep research & market analysis persona.
- `abrazy_business_brain` : Business strategy & KPI forecasting persona.

---

## 🚀 Quick Setup

### Option 1: Claude Desktop Integration

Add the following to your Claude Desktop config file (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "abrazy-ai": {
      "command": "python",
      "args": [
        "c:/Users/SMIT 123/Desktop/ai-agent-platform/backend/mcp_server.py"
      ],
      "env": {
        "PYTHONPATH": "c:/Users/SMIT 123/Desktop/ai-agent-platform/backend"
      }
    }
  }
}
```

### Option 2: Cursor / Antigravity IDE Integration

Point your MCP settings to:
- **Command**: `python`
- **Args**: `["backend/mcp_server.py"]`
- **Working Dir**: `<Workspace Root>`

### Option 3: Direct CLI Testing

```powershell
cd backend
python -m app.mcp.server
```

---

## 🧪 Testing with Python Script

You can run a direct JSON-RPC verification script:

```python
import json
import subprocess

req = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "abrazy_enhance_prompt",
        "arguments": {
            "prompt": "write a python script for scraping web data",
            "agent_id": "3",
            "enhancement_level": "advanced"
        }
    }
}

p = subprocess.Popen(
    ["python", "backend/mcp_server.py"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True
)

stdout, _ = p.communicate(json.dumps(req) + "\n")
print("Response:", stdout)
```
