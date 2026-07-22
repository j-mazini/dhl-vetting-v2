# DHL Vetting Tracker - Pages Structure

This folder contains the two main sections of the application:

## 📁 Structure

```
pages/
├── landing/              # Landing page (public)
│   ├── page.tsx         # Main landing page
│   └── components/      # Landing components
│       ├── LandingHeader.tsx
│       ├── EnhancedHeroSection.tsx
│       ├── ServiceTabs.tsx
│       ├── FleetSpotlight.tsx
│       └── ContactForm.tsx
│
└── vetting/             # Vetting flow (driver portal)
    ├── page.tsx         # Redirect to login
    ├── layout.tsx       # Vetting layout wrapper
    ├── login/
    │   └── page.tsx     # Driver login
    ├── register/
    │   └── page.tsx     # Pre-registration
    ├── dashboard/
    │   └── page.tsx     # Driver portal
    └── components/      # Vetting components
        ├── PreRegistrationForm.tsx
        └── WorkHistoryForm.tsx
```

## 🏠 Landing Page (`/landing`)

**Route:** `/`

Main entry point for the application. Showcases:
- DHL Vetting Tracker branding
- Service information
- Fleet details
- Contact information

### Components Used
- `LandingHeader` - Navigation with logo and links
- `EnhancedHeroSection` - Hero section with animation
- `ServiceTabs` - Service showcase
- `FleetSpotlight` - Fleet information
- `ContactForm` - Contact form

## 🔐 Vetting Flow (`/vetting`)

**Route:** `/vetting/*`

Driver portal for vetting process:
- `/vetting/login` - Login page
- `/vetting/register` - Pre-registration
- `/vetting/dashboard` - Driver portal with progress tracking

### Authentication
Uses Firebase Authentication with email/password login.

### Features
- Document submission
- Progress tracking
- Work history management
- Real-time status updates

## 📝 Usage

Reference these pages in your main `src/app/` routing:

```typescript
// src/app/page.tsx
import LandingPage from '@/pages/landing/page';

export default function Home() {
  return <LandingPage />;
}
```

```typescript
// src/app/vetting/layout.tsx
import VettingLayout from '@/pages/vetting/layout';

export default function Layout({ children }) {
  return <VettingLayout>{children}</VettingLayout>;
}
```

## 🚀 Development

All pages are fully functional Next.js 14+ with:
- React 19
- TypeScript
- Firebase integration
- Framer Motion animations
- CSS Modules

Last updated: 2026-07-22
