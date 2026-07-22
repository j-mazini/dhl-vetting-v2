# BA Express Vetting System - Frontend

**Vetting 2.0 System** integrated with BA Express landing page.

Frontend: Next.js 16 + React 19 + TypeScript  
Backend: NestJS + Firestore  
Status: 🟢 Ready for development

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:3011`
- `.env.local` configured (see `.env.local.example`)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local

# 3. Edit .env.local with your values
nano .env.local

# 4. Start development server
npm run dev
```

Access at: **http://localhost:3000**

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── vetting/
│       ├── layout.tsx        # Vetting routes layout
│       ├── login/
│       │   └── page.tsx      # Login page
│       ├── register/
│       │   └── page.tsx      # Pre-registration page
│       └── dashboard/
│           └── page.tsx      # Driver portal
├── components/
│   ├── vetting/
│   │   ├── PreRegistrationForm.tsx
│   │   ├── DriverDashboard.tsx
│   │   └── AdminDashboard.tsx
│   └── shared/
│       └── Header.tsx
├── context/
│   └── AuthContext.tsx       # Global auth state
├── services/
│   └── api/
│       ├── client.ts         # HTTP client
│       ├── auth.ts           # Auth API
│       ├── drivers.ts        # Drivers API
│       └── admin.ts          # Admin API
└── types/
    └── index.ts              # TypeScript types
```

---

## 🔐 Authentication Flow

1. User visits `/vetting/login`
2. Clicks "Login with Google"
3. OAuth redirect to backend
4. Backend returns JWT token
5. Token stored in localStorage
6. AuthContext updates globally
7. Redirected to dashboard

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm run format       # Format code with Prettier

# Testing
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## 🔗 API Integration

All backend API calls use the `apiClient` factory:

```typescript
import { driverService } from '@/services/api/drivers';

// Pre-registration
const response = await driverService.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  // ... other fields
});

// Get driver data
const driver = await driverService.getById(driverId);

// Upload document
const docResponse = await driverService.uploadDocument(driverId, file, 'DBS');
```

---

## 🔑 Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_API_URL=http://localhost:3011/api/v1
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vetting-63c6d
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

See `.env.local.example` for all required variables.

---

## 🧪 Testing

Run tests with:

```bash
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Backend connection failed
```bash
# Check backend is running
curl http://localhost:3011/health

# Verify API_URL in .env.local
echo $NEXT_PUBLIC_API_URL
```

### CORS errors
- Backend CORS not configured correctly
- Check `backend/src/main.ts` enableCors() settings

### Token issues
- Clear localStorage: `localStorage.clear()`
- Check browser DevTools Network tab for 401 responses
- Verify token in localStorage: `localStorage.getItem('authToken')`

### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📚 Documentation

- **Integration Guide**: See `INTEGRATION_SETUP.md`
- **Backend Setup**: See `../backend/QUICK_START.md`
- **API Reference**: See `../backend/DEVELOPMENT_GUIDE.md`
- **Full Architecture**: See `../INTEGRATION_PLAN.md`

---

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/new-feature
```

### 2. Make Changes
- Edit files in `src/`
- Changes auto-reload (hot module replacement)

### 3. Type Check
```bash
npm run type-check
```

### 4. Format Code
```bash
npm run format
```

### 5. Test
```bash
npm test
```

### 6. Commit
```bash
git add .
git commit -m "feat: add new feature"
```

---

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Staging/Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t ba-express-vetting .
docker run -p 3000:3000 ba-express-vetting
```

---

## 📊 Performance

- **Lighthouse**: Target score 90+
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Next.js automatic optimization

---

## 🤝 Support

For issues:
1. Check DevTools Console
2. Review `INTEGRATION_SETUP.md`
3. Check backend logs
4. Verify environment variables

---

**Last Updated**: 2026-06-16  
**Status**: 🟢 Ready for Development  
**Next Step**: Run `npm install && npm run dev`
