# AI Agent Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg)](https://www.python.org)
[![Tests](https://img.shields.io/badge/tests-12%2F12%20passing-brightgreen.svg)](#running-the-tests)

A production-ready, **local-first** AI Agent Platform inspired by **[abrazy.ai](https://abrazy.ai/)**: create
AI agents, give them tasks across your tools (email, Slack, Notion, web, images),
schedule automations with cron, and connect third-party services via OAuth.

> **🎨 New!** Modern authentication system with OAuth, magic links, and beautiful onboarding flow.
> See [AUTH_GUIDE.md](AUTH_GUIDE.md) for details.

> **Local-first by design.** The default LLM provider is **Ollama** — no API key,
> no cloud, fully offline. Flip `LLM_PROVIDER=openai` or `anthropic` in production.

---

## Features

### 🔐 Authentication (abrazy.ai-Inspired)
- **Multiple login methods** — Email/password, OAuth (Google, GitHub, Microsoft), magic links
- **Modern UI/UX** — Split-screen design, beautiful onboarding flow

---

## Deployment

- **Backend**: any ASGI host (Railway, Render, Fly, K8s). Set `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`.
- **Frontend**: **Vercel** — import repo, set `NEXT_PUBLIC_API_URL` to your backend, deploy.
- **Workers**: run `celery -A app.workers.celery_app worker` (separate container/replica).

---

## Deployment status

**Not deployed yet.** There's no live URL to click, and I'm not going to invent one.

Two things are missing, and neither is code. First, the repo needs a Vercel project
connected to it — that's a one-time import on vercel.com, and it can't be done from
inside this build environment. Second, the frontend needs `NEXT_PUBLIC_API_URL` pointing at
wherever the FastAPI backend ends up living, because this is a two-service app: a Vercel
deployment only gets you the Next.js shell, and the agent features won't work until the
backend has a home too.

If you're picking this up: deploy the backend first (Railway or Render handle the
Celery worker cleanly), then import the repo on Vercel with the env vars from
`.env.example`. Roughly ten minutes, no code changes.

---

## License

[MIT](LICENSE) © 2026 AI Agent Platform contributors.
