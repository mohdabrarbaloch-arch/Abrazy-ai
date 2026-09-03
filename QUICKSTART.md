# Quick Start Guide

Get your Teamily AI-inspired platform running in under 5 minutes!

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- PostgreSQL installed (or use SQLite for dev)
- Git installed

## Step 1: Clone & Setup (1 minute)

```bash
# Clone the repository (or use your existing one)
cd ai-agent-platform

# Copy environment variables
cp .env.example backend/.env
```

## Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Run migration for metadata field
# If using PostgreSQL:
# psql -U postgres -d aiagent -f migrations/20260901_add_user_metadata.sql

# Start the backend
uvicorn app.main:app --reload --port 8000
```

Backend is now running at http://localhost:8000

## Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend is now running at http://localhost:3000

## Step 4: Try It Out! (30 seconds)

1. Open http://localhost:3000 in your browser
2. You'll see the modern login page
3. Click "Sign Up" tab
4. Enter:
   - Name: `Your Name`
   - Email: `you@example.com`
   - Password: `password123`
5. Click "Create Account"
6. Complete the 3-step onboarding
7. Welcome to your AI Agent Platform!

## Alternative: Try Magic Link

1. On login page, click "Or sign in with a magic link"
2. Enter your email
3. Check the backend terminal/console for the magic link
4. Copy and paste the link in your browser
5. You're logged in!

## What's Next?

### Create Your First Agent
1. Go to Dashboard
2. Click "Create agent" form
3. Enter name: `Research Assistant`
4. Select tool: `web_search`
5. Click "Create"

### Start a Chat
1. Go to Chat page (nav bar)
2. Select your agent from dropdown
3. Type: `Tell me about AI agents`
4. Watch it respond!

## Troubleshooting

### Backend won't start?
- Check Python version: `python --version` (need 3.11+)
- Make sure virtual environment is activated
- Install dependencies again: `pip install -r requirements.txt`

### Frontend won't start?
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is already in use

### Can't login?
- Make sure backend is running on port 8000
- Check browser console for errors
- Verify `frontend/lib/config.ts` has correct API URL

### Database errors?
- For quick dev, use SQLite: set `DATABASE_URL=sqlite+aiosqlite:///./dev.db` in `.env`
- For PostgreSQL, make sure it's running and database exists

## Configuration

### Switch to OpenAI (instead of Ollama)

Edit `backend/.env`:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Enable OAuth Login

1. Get OAuth credentials (see [AUTH_GUIDE.md](AUTH_GUIDE.md))
2. Edit `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   BACKEND_URL=http://localhost:8000
   ```
3. Restart backend
4. OAuth buttons will now work!

## Docker Setup (Alternative)

If you prefer Docker:

```bash
# Make sure Docker is installed and running
docker --version

# Start everything
docker compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## File Structure Quick Reference

```
ai-agent-platform/
├── frontend/
│   ├── app/
│   │   ├── login/page.tsx          # 🔐 Login page
│   │   ├── onboarding/page.tsx     # 🎯 Onboarding wizard
│   │   ├── dashboard/page.tsx      # 📊 Main dashboard
│   │   └── chat/page.tsx           # 💬 Chat interface
│   └── lib/
│       └── api.ts                  # 🌐 API client
├── backend/
│   ├── app/
│   │   ├── api/routes/auth.py      # 🔑 Auth endpoints
│   │   ├── models.py               # 🗄️ Database models
│   │   └── main.py                 # 🚀 FastAPI app
│   └── .env                        # ⚙️ Configuration
├── AUTH_GUIDE.md                   # 📖 Full auth guide
├── TEAMILY_FEATURES.md            # ✨ Features overview
└── QUICKSTART.md                   # 👈 You are here!
```

## Key Features You Just Got

✅ **Modern Authentication**
- Email/password signup and login
- Magic link passwordless login
- OAuth (Google, GitHub, Microsoft) - needs setup
- Beautiful UI with split-screen design

✅ **Onboarding Flow**
- 3-step wizard
- Role selection
- Use case personalization
- Team size tracking

✅ **AI Agent Platform**
- Create custom AI agents
- Chat interface
- Task automation
- Tool integrations

✅ **Production-Ready**
- JWT authentication
- Secure password hashing
- Rate limiting
- CORS protection
- Mobile responsive

## Common Commands

```bash
# Backend
cd backend
source .venv/bin/activate          # Activate venv
uvicorn app.main:app --reload      # Start backend
pytest                             # Run tests
python -m pip list                 # List packages

# Frontend
cd frontend
npm run dev                        # Start dev server
npm run build                      # Build for production
npm run start                      # Start production server
npm run lint                       # Run linter

# Database (if using PostgreSQL)
psql -U postgres                   # Connect to PostgreSQL
\l                                 # List databases
\c aiagent                         # Connect to database
\dt                                # List tables
```

## Next Steps

1. **Read the docs**:
   - [AUTH_GUIDE.md](AUTH_GUIDE.md) - Detailed authentication setup
   - [AUTHENTICATION_FLOW.md](AUTHENTICATION_FLOW.md) - Technical flows
   - [TEAMILY_FEATURES.md](TEAMILY_FEATURES.md) - Feature comparison

2. **Customize**:
   - Change colors in `frontend/app/login/page.tsx`
   - Modify onboarding questions in `frontend/app/onboarding/page.tsx`
   - Add your branding and logo

3. **Deploy**:
   - See [DEPLOY.md](DEPLOY.md) for deployment guide
   - Set up production database
   - Configure OAuth with production URLs
   - Enable HTTPS

4. **Extend**:
   - Add email verification
   - Implement 2FA
   - Create team features
   - Build agent marketplace

## Support

- 📚 **Documentation**: Check the docs in this repo
- 🐛 **Issues**: Report bugs via GitHub issues
- 💡 **Features**: Suggest improvements
- 🤝 **Contribute**: PRs welcome!

## Screenshots

### Login Page
```
┌─────────────────────────────────────────┐
│ Branding      │  Sign In / Sign Up      │
│ Features      │  OAuth Buttons          │
│ Highlights    │  Email Form             │
│               │  Magic Link Option      │
└─────────────────────────────────────────┘
```

### Onboarding
```
Step 1: What's your role?
┌──────────┬──────────┬──────────┐
│ Developer│ Designer │ Product  │
├──────────┼──────────┼──────────┤
│ Marketing│ Founder  │ Other    │
└──────────┴──────────┴──────────┘

Step 2: What brings you here?
✅ Workflow Automation
✅ Research & Analysis
□ Content Creation
...

Step 3: Team size?
○ Just me
● 2-10 people
○ 11-50 people
○ 50+ people
```

---

**You're all set! Start building with AI agents! 🚀**

Questions? Check [AUTH_GUIDE.md](AUTH_GUIDE.md) or create an issue.
