# 🚀 Abrazy.ai - Complete Docker Setup Guide (Urdu/English)

## Step 1: Docker Desktop Start Karo

### ✅ Check if Docker is Running:
```powershell
docker ps
```

### ❌ Agar error aaye to:

**Windows:**
1. **Start Menu** kholo
2. **"Docker Desktop"** search karo
3. Click karke **start** karo
4. Wait karo jab tak **Docker icon** system tray me green na ho jaye
5. Phir check karo: `docker ps`

**Note:** Docker Desktop start hone me 1-2 minute lag sakte hain

---

## Step 2: Environment Configuration

### Create `.env` file (IMPORTANT!)

Project root me `.env` file already hai, lekin check karo:

```powershell
# Check if .env exists
Test-Path .env
```

### Add Your API Key:

`.env` file me apni **OpenAI API key** dalo:

```env
# Edit this line in .env file:
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-actual-key-here

# OR use Groq (Fast & Free):
# LLM_PROVIDER=groq
# GROQ_API_KEY=gsk_your-groq-key

# OR use Ollama (Local, No API key):
# LLM_PROVIDER=ollama
```

**Get API Keys:**
- **OpenAI**: https://platform.openai.com/api-keys
- **Groq**: https://console.groq.com/keys (Fast & Free tier!)
- **Ollama**: https://ollama.com (Local, no key needed)

---

## Step 3: Run Docker Deployment

### **Method 1: Automated Script** (Easiest!)

```powershell
# Run the deployment script
.\deploy.ps1
```

**Yeh script automatically karega:**
- ✅ Docker containers build
- ✅ PostgreSQL database setup
- ✅ Redis cache setup
- ✅ Database migrations run
- ✅ 300+ agents seed
- ✅ Backend + Frontend + Worker start

**Time:** 3-5 minutes

---

### **Method 2: Manual Docker Commands**

Agar script me issue ho to manually:

```powershell
# 1. Build all containers
docker-compose build

# 2. Start all services
docker-compose up -d

# 3. Wait for database (20 seconds)
Start-Sleep -Seconds 20

# 4. Run migrations
docker-compose exec backend alembic upgrade head

# 5. Seed agents
docker-compose exec backend python seed_agents.py

# 6. Check status
docker-compose ps
```

---

## Step 4: Access Your Platform

Once deployment is complete:

### 🌐 **Frontend**: 
http://localhost:3000

### 🔧 **Backend API**: 
http://localhost:8000

### 📚 **API Documentation**: 
http://localhost:8000/docs

---

## Step 5: Verify Everything is Working

### Check Running Containers:
```powershell
docker-compose ps
```

**You should see 5 services running:**
- ✅ `abrazy-frontend` - Port 3000
- ✅ `abrazy-backend` - Port 8000
- ✅ `abrazy-worker` - Celery tasks
- ✅ `abrazy-db` - PostgreSQL
- ✅ `abrazy-redis` - Redis cache

### Check Logs:
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🎯 Test the Platform

### 1. Open Frontend
```
http://localhost:3000
```

### 2. Go to Discover Page
```
http://localhost:3000/discover
```
You should see **300+ agents**!

### 3. Go to Chat
```
http://localhost:3000/chat
```
Select an agent and start chatting!

---

## 🛑 Stop Services

When you want to stop:

```powershell
# Stop all services
docker-compose down

# Stop and remove all data (CAUTION!)
docker-compose down -v
```

---

## 🔄 Restart Services

```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

---

## 🐛 Troubleshooting

### Problem: Docker Desktop not starting

**Solution:**
1. Open **Task Manager** (Ctrl+Shift+Esc)
2. End `Docker Desktop` process
3. Start Docker Desktop again from Start Menu
4. Wait 2-3 minutes

### Problem: Port 3000 or 8000 already in use

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Problem: Database connection error

**Solution:**
```powershell
# Restart database
docker-compose restart db

# Wait 10 seconds
Start-Sleep -Seconds 10

# Re-run migrations
docker-compose exec backend alembic upgrade head
```

### Problem: Containers not building

**Solution:**
```powershell
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 View Database

```powershell
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d abrazy

# Inside psql:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM agents LIMIT 10;  # View agents
\q               # Quit
```

---

## 🔐 Production Deployment

For production (VPS/Cloud):

### 1. Update Environment:
```env
ENVIRONMENT=production
DEBUG=false
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
SECRET_KEY=<generate-strong-random-key>
```

### 2. Use Managed Services:
- **Database**: Railway, Supabase, or Neon (PostgreSQL)
- **Redis**: Upstash or Railway
- **Frontend**: Vercel
- **Backend**: Railway or DigitalOcean

### 3. Setup SSL:
Use Caddy or Nginx with Let's Encrypt

---

## 📚 Quick Reference

### Essential Commands:
```powershell
# Status
docker-compose ps

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Full restart
docker-compose down && docker-compose up -d

# Rebuild
docker-compose build --no-cache
```

### Access Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Docker containers running (`docker-compose ps`)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Backend accessible (http://localhost:8000)
- [ ] API docs working (http://localhost:8000/docs)
- [ ] Agents visible in `/discover`
- [ ] Chat working with AI responses
- [ ] No errors in logs

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. See [QUICKSTART.md](QUICKSTART.md)
3. See [README.md](README.md)
4. GitHub Issues: https://github.com/mohdabrarbaloch-arch/Abrazy-ai/issues

---

**Ready? Let's start!** 🚀

```powershell
# Make sure Docker Desktop is running, then:
.\deploy.ps1
```
