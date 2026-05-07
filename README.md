# Medithrex — Medical & Laboratory Equipment Platform

Kenya's premier e-commerce platform for medical and laboratory equipment.
**React + Vite** frontend · **Node.js + Express** backend · **PostgreSQL** database.

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (running locally or remote)

---

## 1 — Configure the Database

Copy the env file and fill in your PostgreSQL credentials:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=medithrex
PG_USER=postgres
PG_PASSWORD=your_postgres_password
PG_SSL=false
JWT_SECRET=medithrex_super_secret_key_2024
```

Create the database in PostgreSQL (run once):

```sql
CREATE DATABASE medithrex;
```

---

## 2 — Install, Init & Seed

```bash
# Backend
cd backend
npm install
npm run db:init   # creates all tables
npm run db:seed   # inserts demo users + 12 products

# Frontend
cd ../frontend
npm install
```

---

## 3 — Run

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
# ✅ http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# ✅ http://localhost:5173
```

Or use the one-click scripts:
- **Windows:** double-click `START-WINDOWS.bat`
- **Mac/Linux:** `./START-MAC-LINUX.sh`

---

## Login Credentials

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@medithrex.co.ke     | Admin@2024 |
| User  | jane@hospital.co.ke       | User@2024  |

These are seeded by `npm run db:seed`.

---

## Database Schema

| Table              | Description                          |
|--------------------|--------------------------------------|
| `users`            | Registered accounts (admin / user)   |
| `products`         | Product catalogue (12 demo products) |
| `orders`           | Customer orders                      |
| `order_items`      | Line items per order                 |
| `quotes`           | Quote requests                       |
| `quote_items`      | Line items per quote                 |
| `contact_messages` | Contact form submissions             |

---

## API Endpoints

| Method | Endpoint                 | Auth     | Description            |
|--------|--------------------------|----------|------------------------|
| POST   | /api/auth/register       | —        | Create account         |
| POST   | /api/auth/login          | —        | Sign in                |
| GET    | /api/auth/profile        | Required | Get profile            |
| PUT    | /api/auth/profile        | Required | Update profile         |
| GET    | /api/products            | —        | List with filters      |
| GET    | /api/products/categories | —        | Category counts        |
| GET    | /api/products/:id        | —        | Single product         |
| POST   | /api/orders              | Required | Place order            |
| GET    | /api/orders/my           | Required | My orders              |
| POST   | /api/quotes              | —        | Submit quote request   |
| GET    | /api/quotes/my           | Required | My quotes              |
| POST   | /api/contact             | —        | Send contact message   |
| GET    | /api/health              | —        | Health + DB status     |

---

## Verify Everything Works

```bash
# Health check (should show PostgreSQL connected)
curl http://localhost:5000/api/health

# Products
curl http://localhost:5000/api/products

# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

---

## Contact

**Medithrex Medical Solutions** · 📞 0790 080 903 · 📍 Nairobi, Kenya
