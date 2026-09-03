# Deploy Guide — GitHub + Vercel

> **Note:** `gh` CLI is not installed on the build machine, so the GitHub push is
> done manually (steps below). Everything else is automated.

## 1. Push to a new GitHub repo

```bash
cd ai-agent-platform
git init
git add .
git commit -m "feat: production-ready AI Agent Platform (FastAPI + Next.js)"

# Create repo on github.com (New repository, name: ai-agent-platform) then:
git remote add origin https://github.com/<you>/ai-agent-platform.git
git branch -M main
git push -u origin main
```

Optional — use the GitHub CLI if you install it (`winget install GitHub.cli`):
```bash
gh auth login
gh repo create ai-agent-platform --public --source=. --push
```

## 2. Deploy frontend to Vercel

1. Go to https://vercel.com/new → Import your `ai-agent-platform` repo.
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend-host>` (your deployed API)
5. Deploy.

## 3. Deploy the backend (ASGI)

Any ASGI host works. Example: **Railway / Render / Fly.io**.

Required env:
- `DATABASE_URL` (Postgres)
- `REDIS_URL` (Redis)
- `SECRET_KEY` (long random)
- `LLM_PROVIDER` = `ollama` (need an Ollama host) OR `openai`/`anthropic` + key
- `CORS_ORIGINS` = your Vercel URL

Then run a worker: `celery -A app.workers.celery_app worker`.

## 4. Local-first (no cloud, no keys)

```bash
docker compose up --build      # db + redis + ollama + backend + worker + frontend
# OR run pieces locally (see README Quick Start)
```

## 5. Verify after deploy

```bash
curl https://<api>/api/health      # {"status":"ok",...}
curl https://<api>/api/models      # lists models
```
