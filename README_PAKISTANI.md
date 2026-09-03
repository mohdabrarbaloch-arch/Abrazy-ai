# 🇵🇰 Teamily AI - Pakistan Version

**Aapka Pakistani AI Agent Platform!**

## Kya Hai Yeh?

Bilkul [Teamily.ai](https://teamily.ai) jaisa modern AI chat platform - lekin **Pakistani context** ke saath!

### ✨ Features

- 🤖 **5 Pre-trained AI Agents** - Rafay AI, Research Pro, Code Master, Content Creator, Business Guru
- 💚 **WhatsApp-Style UI** - Jaisi aapko pasand hai
- 📱 **Mobile-First** - Phone pe perfect chalta hai
- 🇵🇰 **Pakistani Context** - Urdu + English support
- ⚡ **Real-time Chat** - Instant AI responses
- 🎨 **Modern Design** - Professional aur beautiful

---

## 🚀 1-Minute Setup

### Option 1: Automatic (Recommended)

```powershell
# Run setup script
.\QUICK_START.ps1
```

### Option 2: Manual

```powershell
# Frontend
cd frontend
npm install
npm run dev

# Backend (new terminal)
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Visit**: http://localhost:3000

---

## 🤖 5 AI Agents

### 1. Rafay AI 💬
General purpose Pakistani AI - Urdu + English mein baat karta hai

### 2. Research Pro 📊
Deep research aur data analysis expert

### 3. Code Master ⚡
Programming aur development assistant

### 4. Content Creator 📝
Content writing aur marketing expert

### 5. Business Guru 📈
Business strategy aur growth advisor

---

## 📚 Complete Documentation

Detailed guide: **[TEAMILY_PAKISTAN_SETUP.md](TEAMILY_PAKISTAN_SETUP.md)**

### Quick Links:
- **Setup Guide** → TEAMILY_PAKISTAN_SETUP.md
- **API Docs** → http://localhost:8000/docs
- **Database Info** → See setup guide
- **Deployment** → See setup guide

---

## 💻 Tech Stack

### Frontend
- Next.js 15.1.3 (latest)
- React 19.0.0 (latest)
- Tailwind CSS 3.4.17
- TypeScript
- Lucide Icons

### Backend
- FastAPI (Python)
- SQLAlchemy (Database ORM)
- PostgreSQL / SQLite
- JWT Authentication
- Ollama (Local AI)

---

## 🎨 UI Preview

```
┌─────────────────────────────────────────────────┐
│  Sidebar          │  Chat Area                  │
│                   │                             │
│  🤖 Rafay AI      │  💚 User messages          │
│  🔍 Research Pro  │  ⚪ AI responses           │
│  💻 Code Master   │                             │
│  ✍️  Content      │  [Quick Actions]           │
│  💼 Business      │                             │
│                   │  [_____ Input _____] [Send] │
└─────────────────────────────────────────────────┘
```

---

## 📱 Mobile Responsive

- ✅ Works perfectly on phones
- ✅ Swipe to open/close sidebar
- ✅ Touch-friendly buttons
- ✅ Optimized for small screens

---

## 🔧 Configuration

### Change LLM Provider

Edit `backend/.env`:

```env
# Option 1: Ollama (Free, Local) ✅
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma2:2b

# Option 2: OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key

# Option 3: Anthropic Claude
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Add More Agents

Edit `frontend/app/chat/page.tsx` - add to `agents` array:

```typescript
{
  id: "6",
  name: "Your Agent",
  avatar: "🎯",
  emoji: "✨",
  description: "Your description",
  status: "Active",
  specialty: "Your specialty",
}
```

---

## 🎯 Roadmap

### Phase 1 ✅ (DONE)
- [x] WhatsApp-style UI
- [x] 5 pre-trained agents
- [x] Real-time chat
- [x] Mobile responsive

### Phase 2 (Coming Soon)
- [ ] Voice input/output
- [ ] Image generation
- [ ] File upload
- [ ] Urdu language UI

### Phase 3 (Future)
- [ ] Team collaboration
- [ ] Agent marketplace
- [ ] Analytics dashboard
- [ ] Mobile apps (iOS/Android)

---

## 🐛 Common Issues

### CSS Not Loading?
```bash
cd frontend
Remove-Item -Recurse -Force .next
npm run dev
```

### Backend Won't Start?
```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
```

### Port Already Used?
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

---

## 💰 Business Model

Perfect for Pakistani market:

1. **Freemium** - 100 free messages/month
2. **Pro** - PKR 999/month unlimited
3. **Enterprise** - Custom pricing
4. **API Access** - PKR 2,999/month

---

## 📞 Support

Issues? Questions?

1. Read **TEAMILY_PAKISTAN_SETUP.md**
2. Check **troubleshooting** section
3. Open GitHub issue

---

## 🎉 Start Building!

```bash
# Run setup
.\QUICK_START.ps1

# Or manually
cd frontend && npm run dev
cd backend && uvicorn app.main:app --reload

# Visit
http://localhost:3000
```

**Maza aayega! 🚀🇵🇰**

---

Built with ❤️ in Pakistan
