# AI Agent Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg)](https://www.python.org)
[![Tests](https://img.shields.io/badge/tests-12%2F12%20passing-brightgreen.svg)](#running-the-tests)

A production-ready, **local-first** AI Agent Platform inspired by **[Teamily AI](https://teamily.ai/)**: create
AI agents, give them tasks across your tools (email, Slack, Notion, web, images),
schedule automations with cron, and connect third-party services via OAuth.

> **🎨 New!** Modern authentication system with OAuth, magic links, and beautiful onboarding flow.
> See [AUTH_GUIDE.md](AUTH_GUIDE.md) for details.

> **Local-first by design.** The default LLM provider is **Ollama** — no API key,
> no cloud, fully offline. Flip `LLM_PROVIDER=openai` or `anthropic` in production.

---

## Features

### 🔐 Authentication (Teamily AI-Inspired)
- **Multiple login methods** — Email/password, OAuth (Google, GitHub, Microsoft), magic links
- **Modern UI/UX** — Split-screen design, beautiful onboarding flow
- **Personalization** — Role-based onboarding, user preferences
- **Mobile-first** — Fully responsive design
- **Secure** — JWT tokens, bcrypt passwords, CSRF protection

### 🤖 Agent Engine
- **LLM orchestration** with a pluggable **tool registry** (web
  search, image generation, Gmail, Slack, Notion). Reasoning + tool-calling loop.
  search, image generation, Gmail, Slack, Notion). Reasoning + tool-calling loop.
- **Multi-provider LLM** — Ollama (default, zero-key), OpenAI, Anthropic. Env-switchable.
- **Task Queue** — Celery + Redis for background execution, with an **in-process
  fallback** so it runs with no infra. Scheduled **cron** triggers via APScheduler.
- **Live status** — WebSocket streaming of task progress (tokens, tool calls, done).
- **Auth & Security** — JWT access/refresh, API-key auth, bcrypt passwords, CORS,
  Helmet-style security headers, rate limiting, secrets in env only.
- **Integrations** — OAuth flows for Gmail, Slack, Notion, GitHub + inbound webhooks + API keys.
- **Billing** — Stripe checkout + webhook scaffold (gated by `BILLING_ENABLED`).
- **Frontend** — Next.js + Tailwind dashboard, chat (SSE), integrations/settings.
- **Infra** — Docker + docker-compose, `.env.example`, typed & tested backend.

---

## Architecture

```
ai-agent-platform/
├── backend/                 FastAPI agent engine
│   ├── app/
│   │   ├── core/            config, db, security
│   │   ├── models.py        SQLAlchemy models (User, Agent, Task, Integration, ApiKey)
│   │   ├── schemas.py       Pydantic v2 schemas
│   │   ├── agents/          llm adapters + tool registry + orchestrator
│   │   ├── api/routes/      auth, agents, tasks, integrations, billing, webhooks
│   │   ├── workers/         Celery app + scheduler
│   │   └── realtime/        WebSocket hub
│   ├── tests/               12 pytest unit tests
│   └── requirements.txt
├── frontend/                Next.js 14 + Tailwind
│   └── app/                 dashboard, chat, settings, login
├── docker-compose.yml
├── .env.example
└── LICENSE
```

---

## Quick start (local, no Docker)

### 1. Backend (Ollama required)
```bash
# install Ollama, then pull a model
ollama serve
ollama pull gemma3:4b

cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env          # uses sqlite-free async postgres OR set DATABASE_URL
uvicorn app.main:app --reload --port 8000
```
> For local dev without Postgres, set `DATABASE_URL=sqlite+aiosqlite:///./dev.db`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                      # http://localhost:3000
```

### 3. Try it
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@demo.com","password":"password123"}'

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@demo.com","password":"password123"}'
# copy access_token, then:
curl http://localhost:8000/api/agents -H "Authorization: Bearer <token>"
```

---

## Running with Docker

```bash
cp .env.example .env
docker compose up --build
# backend :8000 · frontend :3000 · ollama :11434
```

---

## Running the tests

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
# 12 passed — covers security, LLM adapter selection, tool registry,
# orchestrator parsing, schema validation, config & rate limiter.
```

---

## API reference (highlights)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | JWT pair |
| GET | `/api/auth/me` | JWT | Current user |
| GET/POST | `/api/agents` | JWT | List / create agents |
| POST | `/api/tasks` | JWT | Create + enqueue task |
| POST | `/api/tasks/chat/stream` | JWT | SSE chat with agent |
| GET | `/api/integrations` | JWT | List OAuth integrations |
| GET | `/api/integrations/{p}/connect` | JWT | Start OAuth |
| GET/POST/DELETE | `/api/api-keys` | JWT | API key management |
| POST | `/api/webhooks/{provider}` | — | Inbound webhook → task |
| WS | `/api/ws/tasks/{id}?token=` | JWT | Live task status |
| GET | `/api/health`, `/api/models` | — | Meta |

---

## Security

- Secrets only in environment (`.env`, never committed).
- Passwords hashed with **bcrypt**; JWT `HS256` with configurable TTL.
- API keys: SHA-256 stored, prefix shown, full key once.
- **Helmet-style headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- **CORS** restricted to `CORS_ORIGINS`.
- **Rate limiting** middleware (per-IP, configurable).
- Input validated by **Pydantic v2** everywhere.

---

## Deployment

- **Backend**: any ASGI host (Railway, Render, Fly, K8s). Set `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`.
- **Frontend**: **Vercel** — import repo, set `NEXT_PUBLIC_API_URL` to your backend, deploy.
- **Workers**: run `celery -A app.workers.celery_app worker` (separate container/replica).

---

## License

[MIT](LICENSE) © 2026 AI Agent Platform contributors.
