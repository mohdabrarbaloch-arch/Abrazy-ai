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
from app.api.routes import agents, auth, billing, integrations, keys_webhooks, tasks, abrazy_studio
from app.core.config import settings
from app.core.db import init_db
from app.realtime.ws import router as ws_router

logging.basicConfig(level=settings.LOG_LEVEL)
log = logging.getLogger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    if settings.ENVIRONMENT != "test":
        try:
            from app.workers.scheduler import load_and_schedule

            await load_and_schedule()
        except Exception as e:  # noqa: BLE001
            log.warning("scheduler not started: %s", e)
    yield


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


@app.get("/api/models", tags=["meta"])
async def models():
    from app.agents.llm import get_adapter

    try:
        names = await get_adapter().list_models()
    except Exception:
        names = [settings.OLLAMA_MODEL]
    default = settings.OLLAMA_MODEL if settings.LLM_PROVIDER == "ollama" else names[0] if names else ""
    return {"default": default, "models": [{"id": n, "name": n, "available": True} for n in names]}


app.include_router(auth.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(keys_webhooks.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(abrazy_studio.router, prefix="/api")  # 🎯 Abrazy Studio
app.include_router(ws_router)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.exception("unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
