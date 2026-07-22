# Vetting System Integration Guide

## 📋 Overview

This guide explains how to integrate the Vetting 2.0 system (backend NestJS + frontend React) into the BA Express landing page.

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│      BA Express Landing Page                │
│  (Next.js 16 + React 19 + TypeScript)       │
├─────────────────────────────────────────────┤
│                                             │
│  ├─ /vetting/register      Pre-registration│
│  ├─ /vetting/login         Driver login    │
│  ├─ /vetting/dashboard     Driver portal   │
│  ├─ /admin/vetting         Admin dashboard │
│  └─ /services/api/*        API clients     │
│                                             │
└─────────────┬───────────────────────────────┘
              │
              │ HTTP Requests
              │ (Bearer Token + Cookie)
              ↓
┌─────────────────────────────────────────────┐
│    Vetting 2.0 Backend (NestJS)             │
│         http://localhost:3011               │
├─────────────────────────────────────────────┤
│                                             │
│  ├─ /api/v1/auth/*         Authentication  │
│  ├─ /api/v1/drivers/*      Drivers CRUD    │
│  ├─ /api/v1/admin/*        Admin APIs      │
│  └─ /api/v1/vetting/*      Vetting logic   │
│                                             │
│  Data Storage:                              │
│  ├─ Firestore (Central Driver Record)      │
│  ├─ Google Cloud Storage (Documents)       │
│  └─ Cloud Tasks (Job Queue)                │
│                                             │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm/yarn
- Backend NestJS running at `http://localhost:3011`
- Firebase project configured
- Google OAuth credentials

### 2. Setup Frontend Environment

```bash
# Navigate to landing page directory
cd logix-sphere-landing-page

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your values
nano .env.local

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

**Environment Variables Required:**

```
NEXT_PUBLIC_API_URL=http://localhost:3011/api/v1
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vetting-63c6d
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### 3. Verify Integration

```bash
# Frontend should be running at: http://localhost:3000
# Backend should be running at: http://localhost:3011

# Test backend health:
curl http://localhost:3011/health

# Test frontend loads:
open http://localhost:3000
```

## 📁 File Structure

### New Directories

```
src/
├── context/
│   └── AuthContext.tsx           # Authentication context provider
├── services/
│   └── api/
│       ├── client.ts             # HTTP client factory
│       ├── auth.ts               # Auth service
│       ├── drivers.ts            # Drivers service
│       └── admin.ts              # Admin service
├── components/
│   ├── vetting/
│   │   ├── PreRegistrationForm.tsx
│   │   ├── DriverDashboard.tsx
│   │   └── AdminDashboard.tsx
│   └── shared/
│       └── Header.tsx            # Updated with vetting links
└── app/
    └── vetting/
        ├── register/
        │   └── page.tsx          # Pre-registration page
        ├── login/
        │   └── page.tsx          # Login page
        ├── dashboard/
        │   └── page.tsx          # Driver portal
        └── layout.tsx            # Vetting routes layout
```

## 🔐 Authentication Flow

### 1. **Initial Visit**
```
User visits /vetting/login
    ↓
AuthContext checks localStorage for authToken
    ↓
If token exists:
  - Verify with /auth/me
  - Load user data
  - Redirect to dashboard
Else:
  - Show login buttons
```

### 2. **Google OAuth Login**
```
User clicks "Login with Google"
    ↓
Redirect to: http://localhost:3011/api/v1/auth/google
    ↓
Google OAuth flow completes
    ↓
Backend returns user + JWT token
    ↓
Frontend stores token in localStorage
    ↓
AuthContext updates, redirects to dashboard
```

### 3. **Authenticated Requests**
```
Frontend makes API request:
  Header: Authorization: Bearer {token}
  
Backend validates token:
  If valid → Process request
  If invalid → Return 401 → Frontend clears token → Redirect to login
```

## 🔗 API Integration Points

### AuthContext

Provides authentication state and methods globally:

```typescript
// In any component:
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading, isAuthenticated, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => signIn('google')}>
        Login with Google
      </button>
    );
  }
  
  return <div>Welcome, {user?.fullName}</div>;
}
```

### API Client Services

Call backend APIs using service modules:

```typescript
// Pre-registration
import { driverService } from '@/services/api/drivers';

const response = await driverService.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  // ... other fields
});

// Admin dashboard
import { adminService } from '@/services/api/admin';

const dashboard = await adminService.getDashboard();
const alerts = await adminService.getSlaAlerts();
```

## 📱 Protected Routes

All vetting routes require authentication:

```typescript
// src/app/vetting/layout.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VettingLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/vetting/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return children;
}
```

## 🧪 Testing Integration

### 1. **Test Pre-Registration**

```bash
# Navigate to:
http://localhost:3000/vetting/register

# Fill form and submit
# Expected: Redirect to dashboard
```

### 2. **Test Login**

```bash
# Navigate to:
http://localhost:3000/vetting/login

# Click "Login with Google"
# Complete OAuth flow
# Expected: Redirect to driver dashboard
```

### 3. **Test API Calls**

```bash
# Open browser DevTools (F12)
# Go to Network tab
# Navigate vetting pages
# Verify API calls to localhost:3011

# Expected endpoints:
GET  /api/v1/auth/me
POST /api/v1/drivers
GET  /api/v1/drivers/{id}
GET  /api/v1/admin/dashboard
```

### 4. **Test Protected Routes**

```bash
# Clear localStorage
localStorage.clear()

# Try accessing protected route:
http://localhost:3000/vetting/dashboard

# Expected: Redirect to login
```

## 🛠️ Configuration

### CORS (Backend)

Backend NestJS must allow frontend origin:

```typescript
// backend/src/main.ts
const app = await NestFactory.create(AppModule);

app.enableCors({
  origin: ['http://localhost:3000', 'https://baexpress.co.uk'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

### Token Storage

Tokens are stored in localStorage (for simplicity):

```typescript
// Better approach: httpOnly cookies + server-side validation
// For now using localStorage with Bearer token
```

### API Timeout

Default timeout is 30 seconds. Adjust in `client.ts`:

```typescript
const options: RequestInit = {
  // ...
  signal: AbortSignal.timeout(30000), // 30 seconds
};
```

## 📊 Monitoring Integration

### Check Backend Connectivity

```bash
# Health check
curl -X GET http://localhost:3011/health

# Expected response:
{"status":"ok","timestamp":"2026-06-16T..."}
```

### Check Frontend Logs

Open browser console (DevTools) and look for:

```
✓ AuthContext initialized
✓ User token restored
✓ API call successful
✗ Unauthorized (401)
✗ Network error
```

### Debug API Calls

```typescript
// In client.ts, add logging:
async request<T = any>(...) {
  const url = `${this.baseUrl}${path}`;
  console.log(`[API] ${method} ${url}`);
  // ... rest of request
}
```

## 🔄 Common Issues & Fixes

### Issue: 401 Unauthorized

**Cause:** Token expired or invalid

**Fix:**
```typescript
// Token refresh endpoint implemented in backend
// Frontend automatically redirects to login on 401
```

### Issue: CORS Error

**Cause:** Backend CORS not configured

**Fix:**
```bash
# Backend
# Ensure enableCors() called in main.ts with correct origins
```

### Issue: Token not persisting

**Cause:** localStorage cleared or disabled

**Fix:**
```typescript
// Check if localStorage available
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authToken');
}
```

### Issue: Google OAuth fails

**Cause:** Wrong client ID or invalid origin

**Fix:**
```bash
# Verify in Google Cloud Console:
# 1. Authorized JavaScript origins: http://localhost:3000, https://baexpress.co.uk
# 2. Authorized redirect URIs: http://localhost:3011/api/v1/auth/google/callback
```

## 📈 Next Steps

### Phase 1: Foundation (Week 1)
- ✅ AuthContext setup
- ✅ API client factory
- ✅ Pre-registration form
- [ ] Login page
- [ ] Driver dashboard layout

### Phase 2: Features (Week 2)
- [ ] Document upload
- [ ] Interview scheduling
- [ ] Admin dashboard
- [ ] Real-time updates

### Phase 3: Integration (Week 3)
- [ ] DHL webhook integration
- [ ] Email notifications
- [ ] State machine transitions
- [ ] Full end-to-end testing

### Phase 4: Deployment (Week 4)
- [ ] Staging environment
- [ ] Security audit
- [ ] Performance testing
- [ ] Production release

## 📚 Documentation

- **Backend Setup:** See `backend/QUICK_START.md`
- **API Reference:** See `backend/DEVELOPMENT_GUIDE.md`
- **Architecture:** See `INTEGRATION_PLAN.md`
- **Firebase Setup:** See `backend/FIREBASE_ARCHITECTURE.md`

## 🤝 Support

For issues or questions:
1. Check the relevant guide above
2. Review error logs in DevTools
3. Check backend logs: `npm run dev` output
4. Ensure both services running: `localhost:3000` + `localhost:3011`

---

**Last Updated:** 2026-06-16  
**Status:** 🟢 Ready for implementation
