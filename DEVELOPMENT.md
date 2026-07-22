# Development Setup Guide

## ✅ Setup Complete!

Your Vetting 2.0 System frontend is ready to run with **`npm run dev`**.

---

## 🚀 Start Development

### 1️⃣ Install Dependencies

```bash
cd logix-sphere-landing-page
npm install
```

**Expected output:**
```
added X packages in Ys
```

### 2️⃣ Configure Environment

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your values (Firebase, Google OAuth, etc)
nano .env.local
```

**Required variables:**
```
NEXT_PUBLIC_API_URL=http://localhost:3011/api/v1
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vetting-63c6d
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 16.2.2
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

---

## 🌐 Access Application

Open in browser:
- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/vetting/login
- **Register**: http://localhost:3000/vetting/register

---

## 📊 Verify Setup

### Check Frontend
```bash
curl http://localhost:3000
# Should return HTML
```

### Check Backend Connection
```bash
curl http://localhost:3011/health
# Should return {"status":"ok"}
```

### Verify Environment
Open browser DevTools (F12) → Console:
```javascript
// Check environment variables
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: http://localhost:3011/api/v1
```

---

## 📁 What Was Created

### Configuration Files
- ✅ `package.json` — All dependencies and scripts
- ✅ `tsconfig.json` — TypeScript configuration
- ✅ `next.config.js` — Next.js configuration
- ✅ `.env.local.example` — Environment template
- ✅ `.gitignore` — Git ignore rules

### App Structure
- ✅ `src/app/layout.tsx` — Root layout with AuthProvider
- ✅ `src/app/globals.css` — Global styles
- ✅ `src/app/page.tsx` — Home page
- ✅ `src/app/vetting/layout.tsx` — Vetting routes layout
- ✅ `src/app/vetting/login/page.tsx` — Login page
- ✅ `src/app/vetting/register/page.tsx` — Registration page
- ✅ `src/app/vetting/dashboard/page.tsx` — Driver dashboard

### Authentication & API
- ✅ `src/context/AuthContext.tsx` — Global auth state
- ✅ `src/services/api/client.ts` — HTTP client factory
- ✅ `src/services/api/auth.ts` — Auth service
- ✅ `src/services/api/drivers.ts` — Drivers service
- ✅ `src/services/api/admin.ts` — Admin service

### Components
- ✅ `src/components/vetting/PreRegistrationForm.tsx` — Registration form

### Documentation
- ✅ `README.md` — Project overview
- ✅ `DEVELOPMENT.md` — This file
- ✅ `INTEGRATION_SETUP.md` — Integration guide

---

## 🎯 Available Commands

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Run production build
npm start

# Code quality
npm run lint          # ESLint
npm run type-check    # TypeScript check
npm run format        # Prettier format

# Testing
npm test              # Jest tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 🔄 Development Workflow

### 1. Make Changes
Edit files in `src/` → Auto-reload in browser

### 2. Check Types
```bash
npm run type-check
```

### 3. Format Code
```bash
npm run format
```

### 4. Test
```bash
npm test
```

### 5. Commit
```bash
git add .
git commit -m "feat: description"
```

---

## 🔧 Backend Integration

### Backend Must Be Running

```bash
cd backend

# Install dependencies
npm install

# Start backend
npm run start:dev
```

**Backend should be at**: `http://localhost:3011`

### Verify Integration

**Test API Call in Frontend:**
```javascript
// In browser console
fetch('http://localhost:3011/health')
  .then(r => r.json())
  .then(console.log)
// Should show: {status: 'ok'}
```

---

## 🐛 Troubleshooting

### Port 3000 Already In Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Dependencies Error
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check types
npm run type-check

# Fix auto-fixable errors
npm run format
```

### CORS/Backend Connection
1. Verify backend running: `curl http://localhost:3011/health`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check backend CORS configuration
4. Clear browser cache (DevTools → Network → Disable cache)

### Hot Reload Not Working
```bash
# Restart dev server
npm run dev

# Or manually refresh browser (Cmd+R)
```

---

## 📚 Additional Documentation

- **Integration Guide**: Read `INTEGRATION_SETUP.md`
- **API Reference**: See `../backend/DEVELOPMENT_GUIDE.md`
- **Full Architecture**: See `../INTEGRATION_PLAN.md`
- **Firebase Setup**: See `../backend/FIREBASE_ARCHITECTURE.md`

---

## ✨ What's Included

### Features Ready
- ✅ Authentication context with Google OAuth
- ✅ HTTP API client with token management
- ✅ Pre-registration form with validation
- ✅ Login page with OAuth flow
- ✅ Driver dashboard with progress tracking
- ✅ Protected routes (auto-redirect to login)
- ✅ Global styling and responsive layout

### Features to Implement
- ⏳ Admin dashboard
- ⏳ Document upload/preview
- ⏳ Interview scheduling
- ⏳ Real-time notifications
- ⏳ Email confirmations

---

## 🎓 Learning Resources

### Next.js
- [Next.js 16 Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app/building-your-application)

### React 19
- [React Docs](https://react.dev)
- [Hooks API](https://react.dev/reference/react)

### TypeScript
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

### Firebase
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Guide](https://firebase.google.com/docs/firestore)

---

## 📞 Support

**Issue?** Check:
1. Error message in browser console
2. Network tab in DevTools (F12)
3. Backend logs
4. `.env.local` configuration
5. Documentation files above

---

## 🚀 Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run dev`
3. Visit http://localhost:3000
4. Test login flow
5. Check DevTools for errors
6. See `INTEGRATION_SETUP.md` for detailed integration guide

---

**Status**: 🟢 Ready to develop  
**Last Updated**: 2026-06-16  
**Questions?** See `README.md` or `INTEGRATION_SETUP.md`
