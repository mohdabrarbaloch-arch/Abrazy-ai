# Authentication Flow Documentation

## Overview

This document describes the complete authentication flow inspired by Teamily AI, including all user journeys and technical implementation details.

## User Journeys

### Journey 1: Email/Password Sign Up

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Landing Page (/)                                         │
│    → Auto redirects to /login                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Login Page (/login)                                      │
│    • User clicks "Sign Up" tab                              │
│    • Enters: Name, Email, Password                          │
│    • Clicks "Create Account"                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend Processing                                       │
│    POST /api/auth/register                                  │
│    • Validates email not exists                             │
│    • Hashes password (bcrypt)                               │
│    • Creates User record                                    │
│    • Returns success                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Auto Login                                               │
│    POST /api/auth/login                                     │
│    • Backend returns access_token + refresh_token           │
│    • Frontend stores in localStorage                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Onboarding (/onboarding)                                 │
│    Step 1: Select Role (Developer, Designer, etc.)          │
│    Step 2: Select Use Cases (Automation, Research, etc.)    │
│    Step 3: Select Team Size (Solo, Small, Medium, Large)    │
│    • PATCH /api/auth/profile with onboarding data           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Dashboard (/dashboard)                                   │
│    • User sees personalized experience                      │
│    • Can create agents, start tasks                         │
└─────────────────────────────────────────────────────────────┘
```

### Journey 2: Email/Password Sign In

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Login Page (/login)                                      │
│    • "Sign In" tab is active (default)                      │
│    • User enters: Email, Password                           │
│    • Clicks "Sign In"                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Authentication                                   │
│    POST /api/auth/login                                     │
│    • Looks up user by email                                 │
│    • Verifies password (bcrypt)                             │
│    • Checks is_active status                                │
│    • Returns access_token + refresh_token                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Dashboard (/dashboard)                                   │
│    • Existing users skip onboarding                         │
│    • Direct access to platform                              │
└─────────────────────────────────────────────────────────────┘
```

### Journey 3: Magic Link (Passwordless)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Login Page (/login)                                      │
│    • User clicks "Or sign in with a magic link"             │
│    • UI switches to magic link mode                         │
│    • User enters: Email only                                │
│    • Clicks "Send Magic Link"                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Processing                                       │
│    POST /api/auth/magic-link                                │
│    • Finds or creates user by email                         │
│    • Generates JWT token (15 min expiry)                    │
│    • DEV: Prints link to console                            │
│    • PROD: Sends email with link                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Success Message                                          │
│    • "Check your email! We sent you a magic link..."        │
│    • User opens email client                                │
│    • Clicks magic link                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Verification Page (/auth/verify?token=...)               │
│    GET /api/auth/magic-link/verify?token=...                │
│    • Backend validates token                                │
│    • Returns access_token + refresh_token                   │
│    • Frontend stores tokens                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Dashboard or Onboarding                                  │
│    • New users → /onboarding                                │
│    • Existing users → /dashboard                            │
└─────────────────────────────────────────────────────────────┘
```

### Journey 4: OAuth (Google/GitHub)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Login Page (/login)                                      │
│    • User clicks "Continue with Google" (or GitHub)         │
│    • Frontend calls API                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. OAuth Initiation                                         │
│    GET /api/auth/oauth/google/connect                       │
│    • Backend generates state token (CSRF)                   │
│    • Constructs OAuth URL with:                             │
│      - client_id                                            │
│      - redirect_uri                                         │
│      - scope                                                │
│      - state                                                │
│    • Returns OAuth URL                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. OAuth Provider (Google/GitHub)                           │
│    • User is redirected to provider                         │
│    • User logs in (if not already)                          │
│    • User authorizes application                            │
│    • Provider redirects back with code                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. OAuth Callback                                           │
│    GET /api/auth/oauth/google/callback?code=...&state=...   │
│    • Backend validates state (CSRF)                         │
│    • Exchanges code for access_token                        │
│    • Fetches user info from provider                        │
│    • Creates or updates User record                         │
│    • Redirects to frontend with tokens                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Callback Handler (/auth/callback?provider=...&code=...)  │
│    • Frontend extracts tokens from URL                      │
│    • Stores in localStorage                                 │
│    • Redirects appropriately                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Dashboard or Onboarding                                  │
│    • New users → /onboarding                                │
│    • Existing users → /dashboard                            │
└─────────────────────────────────────────────────────────────┘
```

## Technical Details

### Token Structure

#### Access Token (JWT)
```json
{
  "sub": "user-id-uuid",
  "exp": 1693526400,
  "iat": 1693522800,
  "type": "access"
}
```

#### Refresh Token (JWT)
```json
{
  "sub": "user-id-uuid",
  "exp": 1696118800,
  "iat": 1693522800,
  "type": "refresh"
}
```

### User Metadata Schema

```json
{
  "role": "developer",
  "use_case": "automation",
  "team_size": "small",
  "interests": ["automation", "research", "coding"],
  "onboarded": true,
  "onboarded_at": "2026-09-01T12:34:56Z",
  "oauth_provider": "google",
  "profile_picture": "https://...",
  "preferences": {
    "theme": "light",
    "language": "en",
    "notifications": true
  }
}
```

### Database Schema Changes

```sql
-- Users table with metadata
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    stripe_customer_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',  -- NEW FIELD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster metadata queries
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);
```

### API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Email/password login | No |
| POST | `/api/auth/refresh` | Refresh access token | No (needs refresh token) |
| GET | `/api/auth/me` | Get current user | Yes |
| PATCH | `/api/auth/profile` | Update profile/onboarding | Yes |
| POST | `/api/auth/magic-link` | Send magic link | No |
| GET | `/api/auth/magic-link/verify` | Verify magic link | No |
| GET | `/api/auth/oauth/{provider}/connect` | Start OAuth flow | No |
| GET | `/api/auth/oauth/{provider}/callback` | Handle OAuth callback | No |

### Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Landing redirect | Auto redirects to `/login` |
| `/login` | Login page | All authentication methods |
| `/onboarding` | Onboarding wizard | New user personalization |
| `/auth/callback` | OAuth callback handler | Process OAuth returns |
| `/auth/verify` | Magic link verifier | Verify magic link tokens |
| `/dashboard` | Main dashboard | Protected, requires auth |

### Security Features

1. **Password Security**
   - Bcrypt hashing with salt
   - Minimum 6 characters (configurable)
   - Never stored or logged in plaintext

2. **Token Security**
   - JWT with HS256 signing
   - Short-lived access tokens (60 min)
   - Long-lived refresh tokens (30 days)
   - Secure token rotation

3. **OAuth Security**
   - State parameter for CSRF protection
   - Secure redirect URIs
   - Token exchange over HTTPS only (production)

4. **API Security**
   - Rate limiting (60 req/min per IP)
   - CORS restrictions
   - Input validation (Pydantic)
   - SQL injection prevention (SQLAlchemy ORM)

5. **Frontend Security**
   - XSS prevention (React auto-escaping)
   - CSRF token for sensitive operations
   - Secure token storage (move to httpOnly cookies in prod)

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials**
   ```json
   {
     "detail": "Invalid credentials"
   }
   ```
   Status: 401 Unauthorized

2. **Email Already Exists**
   ```json
   {
     "detail": "Email already registered"
   }
   ```
   Status: 409 Conflict

3. **Expired Token**
   ```json
   {
     "detail": "Token has expired"
   }
   ```
   Status: 401 Unauthorized

4. **OAuth Error**
   ```json
   {
     "detail": "OAuth provider error: ..."
   }
   ```
   Status: 400 Bad Request

5. **Account Disabled**
   ```json
   {
     "detail": "Account disabled"
   }
   ```
   Status: 403 Forbidden

## Future Enhancements

### Phase 2: Enhanced Security
- [ ] Email verification before full access
- [ ] Two-factor authentication (2FA/MFA)
- [ ] Session management and device tracking
- [ ] Account lockout after failed attempts
- [ ] Password reset flow
- [ ] Security audit logs

### Phase 3: Social Features
- [ ] Profile pictures from OAuth providers
- [ ] Social login completion (full OAuth flow)
- [ ] Team invitations
- [ ] Workspace management
- [ ] Role-based access control (RBAC)

### Phase 4: Advanced Features
- [ ] SSO (Single Sign-On) support
- [ ] SAML integration
- [ ] WebAuthn/Passkeys
- [ ] Biometric authentication
- [ ] Device fingerprinting
- [ ] Anomaly detection

## Testing

### Manual Testing Checklist

- [ ] Email/password registration
- [ ] Email/password login
- [ ] Invalid credentials handling
- [ ] Duplicate email prevention
- [ ] Magic link generation
- [ ] Magic link verification
- [ ] OAuth Google flow
- [ ] OAuth GitHub flow
- [ ] Onboarding completion
- [ ] Profile update
- [ ] Token refresh
- [ ] Logout
- [ ] Protected route access
- [ ] Mobile responsive design

### Automated Tests (To Add)

```python
# tests/test_auth_flow.py
def test_register_new_user():
    """Test user registration"""
    pass

def test_login_with_valid_credentials():
    """Test login with valid credentials"""
    pass

def test_login_with_invalid_credentials():
    """Test login fails with invalid credentials"""
    pass

def test_magic_link_generation():
    """Test magic link token generation"""
    pass

def test_magic_link_verification():
    """Test magic link token verification"""
    pass

def test_oauth_flow_initiation():
    """Test OAuth flow starts correctly"""
    pass

def test_profile_update():
    """Test user profile update"""
    pass
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Authentication Metrics**
   - Registration rate
   - Login success/failure rate
   - OAuth vs email/password ratio
   - Magic link usage rate
   - Average onboarding completion time

2. **Security Metrics**
   - Failed login attempts
   - Token refresh rate
   - Expired token usage attempts
   - OAuth errors

3. **User Engagement**
   - New vs returning users
   - Onboarding completion rate
   - Drop-off points in onboarding
   - Time to first action post-login

## Support & Troubleshooting

### Common Issues

**Issue**: OAuth callback returns error
**Solution**: Check redirect URIs match exactly in OAuth provider settings

**Issue**: Magic link not working
**Solution**: Check token expiry (15 min), verify email service configured

**Issue**: Tokens not persisting
**Solution**: Check localStorage availability, browser privacy settings

**Issue**: CORS errors
**Solution**: Verify CORS_ORIGINS in backend config includes frontend URL

---

For more details, see:
- [AUTH_GUIDE.md](AUTH_GUIDE.md) - Setup and configuration
- [README.md](README.md) - Project overview
- [DEPLOY.md](DEPLOY.md) - Deployment guide
