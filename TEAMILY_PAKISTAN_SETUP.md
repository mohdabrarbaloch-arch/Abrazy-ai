# 🇵🇰 Teamily AI - Pakistan Version

## Complete Setup Guide

### ✅ Kya Banaya Hai

1. **WhatsApp-Style Chat Interface** - Bilkul Teamily AI jaisa
2. **5 Pre-trained AI Agents** - Pakistani context ke saath
3. **Green Theme (#00D35A)** - Teamily ka signature color
4. **Mobile-First Design** - Phone pe perfect chalta hai
5. **Professional UI** - Production-ready design

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Frontend Setup

```powershell
cd frontend

# Clean old files
Remove-Item -Recurse -Force node_modules, package-lock.json, .next -ErrorAction SilentlyContinue

# Install dependencies (Latest: Next.js 15, React 19, Tailwind 3.4.17)
npm install

# Start frontend
npm run dev
```

**Frontend URL**: http://localhost:3000

### Step 2: Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn app.main:app --reload
```

**Backend URL**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

---

## 🤖 5 Pre-Trained Pakistani AI Agents

### 1. **Rafay AI** 💬
- **Role**: General purpose assistant
- **Specialty**: Har tarah ki madad
- **Language**: Urdu + English
- **Use Case**: Daily questions, general help

### 2. **Research Pro** 📊
- **Role**: Research & analysis expert
- **Specialty**: Deep research, data analysis
- **Language**: Professional English
- **Use Case**: Business research, market analysis

### 3. **Code Master** ⚡
- **Role**: Programming assistant
- **Specialty**: Coding, debugging, architecture
- **Language**: Technical English
- **Use Case**: Development help, code review

### 4. **Content Creator** 📝
- **Role**: Content writing expert
- **Specialty**: Marketing, copywriting, social media
- **Language**: Creative Urdu/English
- **Use Case**: Blog posts, social content, ads

### 5. **Business Guru** 📈
- **Role**: Business strategy advisor
- **Specialty**: Growth, strategy, planning
- **Language**: Business English
- **Use Case**: Business planning, strategy

---

## 📊 Database Setup

### Current: SQLite (Development)

Backend already uses SQLite - **no setup needed** for development!

```python
# backend/app/core/config.py
DATABASE_URL = "sqlite+aiosqlite:///./dev.db"
```

### Production: PostgreSQL (Recommended)

```bash
# Install PostgreSQL
# Windows: Download from postgresql.org

# Create database
psql -U postgres
CREATE DATABASE teamily_pakistan;
\q

# Update backend/.env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/teamily_pakistan
```

### Database Tables

```sql
-- Users (already exists)
users
├── id (UUID)
├── email
├── hashed_password
├── full_name
├── metadata (JSONB) -- Store Pakistani user preferences
└── created_at

-- Agents (already exists)
agents
├── id (UUID)
├── owner_id (FK → users)
├── name
├── description
├── model (e.g., "gemma3:4b")
├── tools (JSON array)
└── created_at

-- Tasks/Messages (already exists)
tasks
├── id (UUID)
├── owner_id (FK → users)
├── agent_id (FK → agents)
├── title
├── description
├── status (pending/running/success/failed)
├── input (JSON) -- User message
├── output (JSON) -- AI response
└── created_at
```

### Run Migrations

```powershell
cd backend

# If using PostgreSQL, run migration
python -c "from app.core.db import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"

# Or use Alembic (better for production)
alembic revision --autogenerate -m "Initial setup"
alembic upgrade head
```

---

## 🔌 API Endpoints

### Authentication

```http
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login
GET    /api/auth/me           # Get current user
```

### Agents

```http
GET    /api/agents            # List all agents
POST   /api/agents            # Create new agent
GET    /api/agents/:id        # Get specific agent
DELETE /api/agents/:id        # Delete agent
```

### Chat

```http
POST   /api/tasks/chat/stream # Stream chat response (SSE)
GET    /api/tasks             # Get chat history
```

### Example: Send Chat Message

```javascript
const response = await fetch("http://localhost:8000/api/tasks/chat/stream", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
  },
  body: JSON.stringify({
    message: "Hello AI!",
    agent_id: "1"
  })
});

// Read SSE stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // AI response chunks
}
```

---

## 🎨 UI Features

### Colors (Pakistani Theme)

```css
Green:           #00D35A  (Teamily signature)
Green Dark:      #00B84D
Background:      #F5F5F5
Message User:    #DCF8C6  (WhatsApp style)
Message Bot:     #FFFFFF
Border:          #E5E5E5
```

### Responsive Breakpoints

```css
Mobile:    < 768px  (Full screen, hide sidebar)
Tablet:    768px - 1024px (Show/hide sidebar toggle)
Desktop:   > 1024px (Sidebar always visible)
```

### Key Components

1. **Sidebar** (Agent List)
   - Search agents
   - 5 pre-trained agents
   - Active agent highlighting
   - Settings button

2. **Chat Header**
   - Selected agent info
   - Sidebar toggle (mobile)
   - Search messages

3. **Messages Area**
   - WhatsApp-style bubbles
   - Green for user, white for AI
   - Timestamps
   - Smooth animations

4. **Quick Actions**
   - Quick Summary
   - Analyze Data
   - Write Content
   - Get Ideas

5. **Input Area**
   - Auto-expanding textarea
   - Send button (disabled when empty)
   - Attachment button
   - "Powered by Pakistani AI" footer

---

## 🔧 Backend Configuration

### LLM Setup (3 Options)

#### Option 1: Ollama (Free, Local) ✅ RECOMMENDED

```bash
# Install Ollama
# Windows: Download from ollama.ai

# Start Ollama
ollama serve

# Pull model
ollama pull gemma2:2b

# Update backend/.env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma2:2b
```

#### Option 2: OpenAI (Paid, Cloud)

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

#### Option 3: Anthropic Claude (Paid, Cloud)

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

---

## 🌍 Add More Agents (Badhanay Ka Tarika)

### Frontend mein add karo:

Edit `frontend/app/chat/page.tsx`:

```typescript
const agents: Agent[] = [
  // ... existing agents ...
  {
    id: "6",
    name: "Urdu Expert",
    avatar: "📚",
    emoji: "🇵🇰",
    description: "Urdu language and literature specialist",
    status: "Active",
    specialty: "Urdu Language",
  },
];
```

### Backend mein agent create karo:

```http
POST http://localhost:8000/api/agents
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Urdu Expert",
  "description": "Urdu language specialist",
  "model": "gemma2:2b",
  "tools": ["web_search"],
  "system_prompt": "You are an Urdu language expert. Help users with Urdu literature, poetry, and language."
}
```

---

## 📱 Mobile Responsive

### Mobile View (<768px)
- Sidebar hidden by default
- Menu button shows sidebar
- Full-width chat
- Touch-friendly buttons

### Desktop View (>1024px)
- Sidebar always visible
- Side-by-side layout
- Hover effects
- Keyboard shortcuts

---

## 🚀 Deployment

### Frontend (Vercel) - FREE

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend-url.com
```

### Backend (Railway/Render) - FREE Tier

#### Railway:
1. Go to railway.app
2. Connect GitHub repo
3. Add `backend` folder
4. Set environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `LLM_PROVIDER`
5. Deploy!

#### Render:
1. Go to render.com
2. New Web Service
3. Connect repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🔒 Security

### Backend Security (Already Implemented)

```python
# JWT Authentication
- Access tokens: 60 min expiry
- Refresh tokens: 30 days
- Bcrypt password hashing

# Rate Limiting
- 60 requests/minute per IP

# CORS
- Only allowed origins

# Input Validation
- Pydantic models everywhere

# SQL Injection Prevention
- SQLAlchemy ORM
```

### Frontend Security

```typescript
// Store JWT in localStorage
localStorage.setItem("token", accessToken);

// Send with every request
headers: {
  "Authorization": `Bearer ${token}`
}

// XSS Prevention
- React auto-escapes
- No dangerouslySetInnerHTML

// HTTPS in Production
- Always use HTTPS
- Secure cookies
```

---

## 📊 Performance Tips

### Frontend Optimization

```typescript
// 1. Use React.memo for agent list
const AgentItem = React.memo(({ agent }) => ...);

// 2. Debounce search input
const debouncedSearch = useMemo(
  () => debounce((value) => setSearch(value), 300),
  []
);

// 3. Virtualize long message lists
import { VirtualList } from 'react-virtualized';

// 4. Lazy load images
<img loading="lazy" src="..." />
```

### Backend Optimization

```python
# 1. Database indexing
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_agents_owner ON agents(owner_id);

# 2. Connection pooling
# SQLAlchemy automatically handles this

# 3. Caching (Redis)
@cache(ttl=300)
async def get_agents(user_id: str):
    ...

# 4. Async everywhere
async def process_message(msg: str):
    ...
```

---

## 🐛 Troubleshooting

### Issue: CSS Not Loading

```bash
# Delete .next folder
cd frontend
Remove-Item -Recurse -Force .next
npm run dev
```

### Issue: Backend Won't Start

```powershell
# Check Python version (need 3.11+)
python --version

# Reinstall dependencies
cd backend
Remove-Item -Recurse -Force .venv
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Database Error

```bash
# Reset database (CAUTION: Deletes all data)
cd backend
Remove-Item dev.db
python -c "from app.core.db import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

### Issue: CORS Error

```python
# backend/app/core/config.py
CORS_ORIGINS = ["http://localhost:3000", "https://your-frontend.vercel.app"]
```

---

## 📈 Next Steps

### Phase 1: Core Features ✅ (DONE)
- [x] WhatsApp-style UI
- [x] 5 pre-trained agents
- [x] Chat functionality
- [x] Mobile responsive

### Phase 2: Enhanced Features (Next)
- [ ] Voice input/output
- [ ] Image generation
- [ ] File upload
- [ ] Agent marketplace
- [ ] Team collaboration

### Phase 3: Pakistani Localization
- [ ] Urdu language support
- [ ] Pakistani payment methods (JazzCash, EasyPaisa)
- [ ] Local context awareness
- [ ] Pakistani holidays & culture

### Phase 4: Advanced Features
- [ ] Multi-modal AI (text + images + voice)
- [ ] Agent workflows & automation
- [ ] Analytics dashboard
- [ ] White-label solution

---

## 💰 Monetization Ideas (Pakistani Market)

1. **Freemium Model**
   - Free: 100 messages/month
   - Pro: PKR 999/month (unlimited)
   - Enterprise: Custom pricing

2. **Pay-per-Agent**
   - PKR 199/month per additional agent
   - Bulk discounts for teams

3. **API Access**
   - PKR 2,999/month for API access
   - Developer-friendly pricing

4. **White Label**
   - PKR 49,999/month for branded solution
   - Perfect for agencies

---

## 📞 Support & Contact

**Developer**: Your Name  
**Email**: your.email@example.com  
**GitHub**: github.com/yourusername  
**Website**: teamily-pakistan.com

---

## 🎉 You're Ready!

```bash
# Start both servers
# Terminal 1: Backend
cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Visit: http://localhost:3000
```

**Enjoy your Teamily AI - Pakistan Version! 🇵🇰🚀**
