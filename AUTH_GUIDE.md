# Authentication System Guide

## Overview

This authentication system is inspired by **Teamily AI** and provides multiple modern authentication methods:

- ✉️ **Email/Password** - Traditional authentication
- 🔗 **Magic Links** - Passwordless authentication via email
- 🌐 **OAuth Providers** - Google, GitHub, Microsoft sign-in
- 📱 **Mobile-First UI** - Beautiful, responsive design
- 🎨 **Onboarding Flow** - Personalized user experience

## Features Implemented

### Frontend (`frontend/`)

1. **Modern Login Page** (`app/login/page.tsx`)
   - Tab-based UI (Sign In / Sign Up)
   - OAuth buttons (Google, GitHub)
   - Magic link option
   - Split-screen design with branding
   - Error and success states
   - Mobile responsive

2. **Onboarding Flow** (`app/onboarding/page.tsx`)
   - 3-step wizard (Role → Use Cases → Team Size)
   - Progress indicator
   - Personalization data collection
   - Skip option
   - Beautiful card-based selection

3. **OAuth Callback Handler** (`app/auth/callback/page.tsx`)
   - Handles OAuth redirects
   - Token extraction and storage
   - Error handling
   - Loading states

4. **Magic Link Verification** (`app/auth/verify/page.tsx`)
   - Verifies magic link tokens
   - Auto-login
   - Error handling

### Backend (`backend/`)

1. **Enhanced Auth Routes** (`app/api/routes/auth.py`)
   - `POST /api/auth/register` - Create account
   - `POST /api/auth/login` - Email/password login
   - `POST /api/auth/refresh` - Refresh tokens
   - `GET /api/auth/me` - Get current user
   - `PATCH /api/auth/profile` - Update profile/onboarding data
   - `POST /api/auth/magic-link` - Send magic link
   - `GET /api/auth/magic-link/verify` - Verify magic link
   - `GET /api/auth/oauth/{provider}/connect` - Start OAuth flow
   - `GET /api/auth/oauth/{provider}/callback` - Handle OAuth callback

2. **User Model Updates** (`app/models.py`)
   - Added `metadata` JSON field for onboarding data
   - Stores role, use case, team size, interests
   - OAuth provider tracking

3. **Configuration** (`app/core/config.py`)
   - OAuth client IDs and secrets
   - Backend URL for OAuth redirects
   - All secrets via environment variables

## Setup Instructions

### 1. Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp ../.env.example .env
   ```

3. **Update `.env` with OAuth credentials (optional):**
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Microsoft OAuth
   MICROSOFT_CLIENT_ID=your-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
   
   BACKEND_URL=http://localhost:8000
   ```

4. **Run database migrations:**
   ```bash
   # If using PostgreSQL
   psql -U postgres -d aiagent -f migrations/20260901_add_user_metadata.sql
   
   # Or let SQLAlchemy create tables automatically
   python -c "from app.core.db import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
   ```

5. **Start the backend:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL:**
   ```bash
   # frontend/lib/config.ts already points to http://localhost:8000
   # Update if your backend runs on a different URL
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open http://localhost:3000
   - You'll be redirected to the login page

## OAuth Setup (Optional but Recommended)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - `http://localhost:8000/api/auth/oauth/google/callback`
   - `https://yourdomain.com/api/auth/oauth/google/callback` (production)
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Application name: Your App Name
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: `http://localhost:8000/api/auth/oauth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Add redirect URI: `http://localhost:8000/api/auth/oauth/microsoft/callback`
5. Go to "Certificates & secrets" → Create new client secret
6. Copy Application (client) ID and Client Secret to `.env`

## Usage

### Standard Email/Password

1. Click "Sign Up" tab
2. Enter name, email, and password
3. Click "Create Account"
4. Complete onboarding flow
5. Start using the platform

### Magic Link

1. Click "Or sign in with a magic link"
2. Enter your email
3. Check console for magic link (in dev mode)
4. Click the link to auto-login
5. In production, this will send an email

### OAuth (Google/GitHub)

1. Click "Continue with Google" or "Continue with GitHub"
2. Authorize the application
3. You'll be redirected back and logged in
4. Complete onboarding if new user

## Architecture

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Login Request
       ▼
┌─────────────────┐
│    Frontend     │
│   (Next.js)     │
└────────┬────────┘
         │
         │ 2. API Call
         ▼
┌──────────────────┐
│     Backend      │
│    (FastAPI)     │
└────────┬─────────┘
         │
         │ 3. Verify & Create Token
         ▼
┌──────────────────┐
│    Database      │
│  (PostgreSQL)    │
└──────────────────┘
```

### OAuth Flow

```
Browser → Frontend → Backend → OAuth Provider
                                      │
                                      ▼
Browser ← Frontend ← Backend ← [User Authorizes]
```

### Token Management

- **Access Token**: 60 minutes (configurable)
- **Refresh Token**: 30 days (configurable)
- **Magic Link Token**: 15 minutes
- Tokens stored in localStorage
- Auto-refresh on API calls (implement in production)

## Security Best Practices

1. **Never expose secrets** - Use environment variables
2. **HTTPS in production** - OAuth requires HTTPS
3. **CSRF protection** - State parameter in OAuth
4. **Token rotation** - Refresh tokens properly
5. **Rate limiting** - Prevent brute force attacks
6. **Email verification** - Verify emails before magic links (production)
7. **Secure cookies** - HttpOnly, Secure, SameSite flags

## Customization

### Branding

Edit `frontend/app/login/page.tsx`:
- Change colors: `#00a884` → your brand color
- Update logo and text
- Modify feature highlights

### Onboarding Steps

Edit `frontend/app/onboarding/page.tsx`:
- Add/remove steps
- Customize questions
- Change icons and labels

### OAuth Providers

Add new providers in `backend/app/api/routes/auth.py`:
1. Add config to `oauth_configs` dict
2. Implement token exchange
3. Add button to login page

## Production Checklist

- [ ] Change `SECRET_KEY` to random string
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure real OAuth credentials
- [ ] Set up email service for magic links
- [ ] Enable rate limiting
- [ ] Add email verification
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Use secure cookie storage (not localStorage)
- [ ] Add 2FA/MFA option
- [ ] Implement session management
- [ ] Add account recovery flow

## Troubleshooting

### OAuth not working?
- Check redirect URIs match exactly
- Verify credentials in `.env`
- Check OAuth provider console for errors
- Ensure `BACKEND_URL` is correct

### Magic links not working?
- Check console for dev link
- Verify email service configured (production)
- Check token expiration

### Login fails silently?
- Check browser console for errors
- Verify backend is running
- Check API URL in `frontend/lib/config.ts`
- Check CORS configuration

## Next Steps

1. **Add email service** - SendGrid, AWS SES, Postmark
2. **Implement token refresh** - Auto-refresh expired tokens
3. **Add session management** - Track active sessions
4. **2FA/MFA** - TOTP-based authentication
5. **Account recovery** - Password reset flow
6. **Email verification** - Verify email before full access
7. **Social profile sync** - Pull profile pic from OAuth

## Resources

- [Teamily AI](https://teamily.ai/) - Inspiration
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Auth](https://nextjs.org/docs/authentication)
- [OAuth 2.0](https://oauth.net/2/)

---

Built with ❤️ for modern authentication experiences.
