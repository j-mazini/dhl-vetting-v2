# Apply Interest Modal Integration — BA Express Vetting

**Status:** ✅ Implementation Complete  
**Date:** 2026-07-07  
**Location:** `/Users/mazinijoaomarcelo/Desktop/dhl-vetting-tracker/aplicacoes/ba-express-vetting`
**Language:** English

---

## What Was Built

An **Apply Interest Modal** that opens when users click "APPLY TO DRIVE" on the landing page.

### User Flow

```
Landing Page
    ↓
Click "APPLY TO DRIVE" (in navbar or terminal view)
    ↓
Modal opens with interest form
    ├─ Full Name (required)
    ├─ Email (required)
    ├─ Phone Number (required)
    └─ Message (optional)
    ↓
User submits → API sends email to HR
    ↓
Success screen appears
    ↓
Modal auto-closes (3 seconds)
```

---

## Files Created/Modified

### New Components
```
src/components/ApplyInterestModal.tsx      (Modal component)
src/components/ApplyInterestModal.module.css (Styles)
```

### API Route
```
src/app/api/v1/apply/send-interest/route.ts   (API endpoint)
```

### Modified Files
```
src/app/page.tsx                              (Added modal import, state, rendering)
src/components/terminal/SiteNav.tsx           (Added onApplyClick prop)
src/components/terminal/TerminalView.tsx      (Added onApplyClick prop)
```

---

## API Endpoint

### `POST /api/v1/apply/send-interest`

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+55 11 98765-4321",
  "message": "Interessado em trabalhar com vocês"
}
```

**Response (201 Created):**
```json
{
  "message": "Interesse recebido. Nossa equipe entrará em contato em breve."
}
```

**Email Sent To:** `info@baexpress.co.uk`

---

## Email Support

The API supports three email methods:

1. **Resend API** (Recommended)
   - Environment: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

2. **SMTP** (Any provider)
   - Environment: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

3. **Console Logging** (Development)
   - No configuration needed
   - Logs to server console

---

## Features

✅ Dark-themed modal matching app design  
✅ Form validation (client + server)  
✅ Loading state with spinner  
✅ Success screen with checkmark  
✅ Auto-close after 3 seconds  
✅ Escape key to close  
✅ Backdrop click to close  
✅ Fully responsive (mobile-first)  
✅ Keyboard accessible (Tab, Enter)  
✅ Portuguese & English text  

---

## How to Test

### 1. Install Dependencies
```bash
cd /Users/mazinijoaomarcelo/Desktop/dhl-vetting-tracker/aplicacoes/ba-express-vetting
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Open Browser
```
http://localhost:3000
```

### 4. Test Modal
- Click "APPLY TO DRIVE" button in navbar
- OR scroll to terminal section and click "OPEN APPLY FORM"
- Fill form with test data
- Click "Enviar Candidatura"
- See success screen
- Modal auto-closes

### 5. Check Email
- Open server console
- Look for "[HR Email Notification]"
- Should show applicant details

---

## Environment Variables (Optional)

### For Email Service
```env
# Resend API
RESEND_API_KEY=your_key_here
RESEND_FROM_EMAIL=noreply@baexpress.co.uk

# OR SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Always
HR_EMAIL=info@baexpress.co.uk
```

---

## Tech Stack

- **Frontend:** React 18, Next.js 16, TypeScript
- **Forms:** Zod validation
- **Email:** nodemailer (installed), Resend API (optional)
- **Styling:** CSS Modules

---

## Dependencies Added

```
nodemailer
@types/nodemailer
```

Both are already installed via `npm install`.

---

## Security

✅ Client-side validation  
✅ Server-side validation (Zod)  
✅ No database access  
✅ Input sanitized before email  
✅ CSRF protection (Next.js default)  

---

## Next Steps

1. ✅ Components created
2. ✅ API endpoint created
3. ✅ Landing page integrated
4. ⏳ Test in browser
5. ⏳ Set up email service (Resend or SMTP)
6. ⏳ Deploy to production

---

## Troubleshooting

**Modal not opening?**
- Check browser console for errors
- Verify ApplyInterestModal is imported in page.tsx
- Confirm isApplyModalOpen state is working

**Form not submitting?**
- Check Network tab in DevTools
- Verify API endpoint `/api/v1/apply/send-interest` exists
- Check server console for errors

**Email not received?**
- For dev: Check server console for "[HR Email Notification]"
- For Resend: Verify API key and from email
- For SMTP: Verify credentials and connection

---

## Status: READY FOR TESTING

All components are built and integrated. Ready to test in the browser!

Start with: `npm run dev` → Click "APPLY TO DRIVE" on the landing page
