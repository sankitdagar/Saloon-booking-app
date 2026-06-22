# Glamour Studio — Saloon Booking App

Full-stack MERN saloon booking application for a single business.

**Stack:** TypeScript, React (Vite), Tailwind CSS, TanStack Query, Node.js, Express, MongoDB, Razorpay, Nodemailer, Twilio

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI at minimum
npm run seed        # Creates demo data
npm run dev         # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev         # http://localhost:5173
```

### Demo Accounts (after seed)

| Role     | Email              | Password     |
|----------|--------------------|--------------|
| Admin    | admin@saloon.com   | admin12345   |
| Staff    | priya@saloon.com   | staff12345   |
| Customer | customer@demo.com  | customer123  |

**Coupons:** `WELCOME20` (20% off), `FLAT100` (₹100 off)

---

## Project Structure

```
Saloon-booking-app/
├── backend/
│   ├── src/
│   │   ├── config/       # env, database, cloudinary
│   │   ├── controllers/  # route handlers
│   │   ├── middleware/   # auth, validation, upload, rate limit
│   │   ├── models/       # 9 Mongoose schemas
│   │   ├── routes/       # REST API routes
│   │   ├── services/     # slots, payments, email, SMS, notifications
│   │   ├── jobs/         # cron reminders
│   │   ├── utils/        # JWT, time helpers
│   │   └── scripts/      # seed data
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/          # Axios API layer
    │   ├── components/   # Navbar, Footer, Layout
    │   ├── context/      # Auth context
    │   ├── pages/        # Customer, Admin, Staff pages
    │   └── types/
    └── .env.example
```

---

## Features Implemented

### Customer
- Register/Login with JWT (access + refresh tokens)
- OTP phone verification (via email in dev)
- Forgot/Reset password
- Browse services (category filter, search)
- Multi-step booking flow (services → staff → slot → review → payment)
- Real-time slot availability
- Razorpay online payment + Pay at Saloon
- Coupon codes + loyalty points
- My Bookings (upcoming/completed/cancelled)
- Cancel/reschedule with 2-hour policy
- Reviews with ratings
- Wishlist, notifications, profile management
- Saloon info page with gallery + Google Maps

### Admin Dashboard
- Revenue charts (Recharts), today's appointments
- Services CRUD with image upload
- Staff CRUD with service assignment
- Booking management (status updates, mark paid)
- Customer list (block/unblock)
- Coupon management
- Review moderation + responses
- Saloon settings (hours, gallery, contact)
- CSV export reports

### Staff Dashboard
- Today's and upcoming appointments
- Mark In Progress / Completed / No Show

### Backend
- JWT auth + role-based access control
- Slot availability algorithm with double-booking prevention
- MongoDB transactions for bookings
- Razorpay payment verification
- Email (Nodemailer) + SMS (Twilio) notifications
- Cron job: 2-hour reminders + auto-cancel unpaid bookings
- Rate limiting, Helmet, CORS, express-validator

---

## Deployment

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user + whitelist IP (`0.0.0.0/0` for cloud deploy)
3. Copy connection string → `MONGODB_URI`

### Backend — Render / Railway
1. Connect GitHub repo, set root directory to `backend`
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Add all env vars from `backend/.env.example`
5. Run seed once: `npm run seed`

### Frontend — Vercel / Netlify
1. Connect repo, set root directory to `frontend`
2. Build: `npm run build`
3. Output: `dist`
4. Env: `VITE_API_URL=https://your-api.onrender.com/api`
5. Env: `VITE_RAZORPAY_KEY_ID=rzp_live_xxx`

### Cloudinary (Images)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret → backend `.env`

### Razorpay
1. Sign up at [razorpay.com](https://razorpay.com)
2. Use test keys for development, live keys for production
3. Add script tag for Razorpay checkout in production (optional — mock payment works in dev)

---

## Optional Features (Future)
- Google OAuth login
- WhatsApp booking chatbot
- Dark mode
- Multi-language (i18n)
- Push notifications (FCM)
- PDF report export
- Real-time slot updates (WebSockets)
