"""FastAPI application entrypoint.

Wires security (CORS + helmet-style headers), rate limiting, REST routers,
WebSocket live status, and the scheduler. The agent engine runs locally via
Ollama by default (no keys required); swap LLM_PROVIDER=openai|anthropic for prod.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.deps import rate_limiter
from app.api.routes import abrazy_studio, agents, auth, automations, billing, conversations, feed, integrations, keys_webhooks, mcp, memory, tasks
from app.core.config import settings
from app.core.db import init_db
from app.realtime.ws import router as ws_router

logging.basicConfig(level=settings.LOG_LEVEL)
log = logging.getLogger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    # Startup
    log.info("🚀 Starting Abrazy.ai API with MCP Support...")
    await init_db()
    log.info("✅ Database initialized")
    
    # Initialize MCP client (lazy-loaded on first use)
    from app.mcp.client import get_mcp_client
    try:
        await get_mcp_client()
        log.info("✅ MCP client initialized")
    except Exception as e:
        log.warning(f"⚠️ MCP client initialization delayed: {e}")
    
    if settings.ENVIRONMENT != "test":
        try:
            from app.workers.scheduler import load_and_schedule
            await load_and_schedule()
            log.info("✅ Scheduler started")
        except Exception as e:  # noqa: BLE001
            log.warning("scheduler not started: %s", e)
    
    yield
    
    # Shutdown
    log.info("🛑 Shutting down Abrazy.ai API...")
    from app.mcp.client import shutdown_mcp_client
    await shutdown_mcp_client()
    log.info("✅ MCP client connections closed")


app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security headers (helmet-like) ---
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https:; connect-src 'self' ws: wss:"
    return response


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api"):
        await rate_limiter(request)
    return await call_next(request)


@app.get("/api/health", tags=["meta"])
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT, "llm_provider": settings.LLM_PROVIDER}


@app.get("/", tags=["meta"])
async def root():
    """Root endpoint - API information"""
    return {
        "status": "online",
        "app": "Abrazy.ai",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "endpoints": {
            "auth": "/api/auth/*",
            "agents": "/api/agents/*",
            "tasks": "/api/tasks/*",
            "memory": "/api/memory/*",
            "integrations": "/api/integrations/*",
        }
    }


@app.get("/api/models", tags=["meta"])
async def models():
    available_models = [
        {"id": "llama-3.3-70b-versatile", "name": "Groq LLaMA 3.3 70B (Ultra-Fast)", "provider": "groq", "available": True},
        {"id": "gemini-2.5-flash", "name": "Google Gemini 2.5 Flash (Smart)", "provider": "gemini", "available": True},
        {"id": "gpt-4o-mini", "name": "OpenAI GPT-4o Mini", "provider": "openai", "available": True},
        {"id": "claude-3-5-haiku-latest", "name": "Anthropic Claude 3.5 Haiku", "provider": "anthropic", "available": True},
        {"id": settings.OLLAMA_MODEL, "name": f"Local Ollama ({settings.OLLAMA_MODEL})", "provider": "ollama", "available": True},
    ]
    default_model = "llama-3.3-70b-versatile" if settings.GROQ_API_KEY else "gemini-2.5-flash" if settings.GEMINI_API_KEY else "gpt-4o-mini"
    return {"default": default_model, "models": available_models}


app.include_router(auth.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(keys_webhooks.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])  # 🧠 Memory Graph
app.include_router(abrazy_studio.router, prefix="/api")  # 🎯 Abrazy Studio
app.include_router(automations.router, prefix="/api")  # ⚡ Automations
app.include_router(feed.router, prefix="/api")  # 📰 Feed
app.include_router(mcp.router, prefix="/api")  # 🔌 MCP Tools
app.include_router(ws_router)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.exception("unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
