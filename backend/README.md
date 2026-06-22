# Saloon Booking — Backend

MERN stack REST API for a single saloon business.

## Tech Choice: TypeScript

The backend uses **TypeScript** for type safety across models, API contracts, and middleware — important for a production app with 50+ endpoints and complex booking logic.

## Folder Structure

```
backend/
├── src/
│   ├── config/           # env, database, cloudinary
│   ├── controllers/      # route handlers (Step 2+)
│   ├── middleware/       # auth, validation, error handling (Step 2+)
│   ├── models/           # Mongoose schemas ✅
│   ├── routes/           # Express routers (Step 2+)
│   ├── services/         # business logic — slots, payments, notifications (Step 3+)
│   ├── utils/            # helpers — JWT, email, time (Step 2+)
│   ├── jobs/             # node-cron scheduled tasks (Step 8)
│   ├── types/            # shared TypeScript types ✅
│   ├── scripts/          # seed scripts
│   ├── app.ts            # Express app setup ✅
│   └── server.ts         # entry point ✅
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Database Models (9 collections)

| Model | Purpose |
|-------|---------|
| **User** | Customers, admins, staff — auth, loyalty, profile |
| **Service** | Saloon services with category, price, duration |
| **Staff** | Stylist profiles linked to User, working hours, services offered |
| **Booking** | Appointments with multi-service support, payment, status |
| **Review** | Post-appointment ratings with optional photos |
| **Coupon** | Discount codes (percentage/flat) |
| **SaloonSettings** | Business info, hours, holidays, policies (singleton) |
| **Notification** | In-app notifications per user |
| **Wishlist** | Customer favorite services |

### Key Indexes

- `Booking`: compound index on `{ staffId, date, startTime }` with partial filter — **prevents double booking**
- `Booking`: `{ staffId, date, status }` — fast slot availability queries
- `Service`: text index on name/description — search
- `User`: unique email, role index

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Visit `http://localhost:5000/api/health` — should return `{ success: true }`.

## Next Step

Say **"continue"** to build the **Auth system** (register, login, JWT refresh, forgot/reset password, OTP phone verification).
