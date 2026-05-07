# Medithrex — Connecting to Neon PostgreSQL + Image Uploads

---

## Part 1 — Connect to Neon

### Step 1 — Create your Neon project

1. Go to **https://console.neon.tech** → Sign up free (no credit card needed)
2. Click **New Project**
3. Name: `medithrex` · Region: choose nearest (e.g. `us-east-2` or `eu-west-1`)
4. Click **Create Project**

### Step 2 — Run the schema

1. In your Neon dashboard, open the **SQL Editor** (left sidebar)
2. Open the file `medithrex-neon.sql`
3. Paste the entire contents into the SQL Editor
4. Click **Run** — you should see all 7 tables created with 0 rows each

### Step 3 — Get your connection string

1. In Neon dashboard → **Connection Details** (top right of your project)
2. Select: **Node.js** format
3. Copy the string — it looks like:

```
postgresql://medithrex_owner:AbCdEf123@ep-cool-name-123456.us-east-2.aws.neon.tech/medithrex?sslmode=require
```

### Step 4 — Configure your .env

Create `backend/.env` (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=pick_a_long_random_string_at_least_32_chars

# Paste your Neon string here:
DATABASE_URL=postgresql://medithrex_owner:YOUR_PASSWORD@ep-xxx.us-east-2.aws.neon.tech/medithrex?sslmode=require

# Leave these blank when using DATABASE_URL:
PG_HOST=
PG_PORT=
PG_DATABASE=
PG_USER=
PG_PASSWORD=

FRONTEND_URL=http://localhost:5173

# Cloudinary (fill in Part 2 below):
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=medithrex_products
```

### Step 5 — Start the backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
🔗 Using DATABASE_URL (Neon / remote PostgreSQL)
✅ PostgreSQL connected
🚀 Medithrex API running on port 5000
```

### Step 6 — Create your first admin account

Register through the app at `http://localhost:5173/register`, then promote to admin:

1. In Neon SQL Editor run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

2. Log in and go to `http://localhost:5173/admin`

---

## Part 2 — Image Uploads (Cloudinary)

Product photos uploaded in the Admin Panel are stored in Cloudinary (free tier = 25 GB).
The Neon database stores only the Cloudinary URLs in the `images` TEXT[] column.

### Step 1 — Create a free Cloudinary account

1. Go to **https://cloudinary.com** → Sign up free
2. After signup, you land on the Dashboard
3. Copy these 3 values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2 — Add to your .env

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
CLOUDINARY_FOLDER=medithrex_products
```

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

This installs `cloudinary`, `multer`, and `multer-storage-cloudinary`.

### Step 4 — Upload images from the Admin Panel

1. Go to `http://localhost:5173/admin/products`
2. Click **Add Product** or **Edit** on an existing product
3. In the **Product Images** section click **Add Photo**
4. Select 1–10 JPEG/PNG/WebP files (max 5 MB each)
5. Selected photos show as "Pending" previews
6. Click **Add Product** / **Save Changes** — images upload to Cloudinary first, then URLs are saved to Neon

### How images are stored in Neon

Each product row stores an array of up to 10 Cloudinary URLs:

```sql
SELECT name, images FROM products WHERE id = 1;

-- Result:
-- name  | images
-- ------+----------------------------------------------------------------
-- X-Ray | {https://res.cloudinary.com/your_cloud/image/upload/v.../product-001.jpg,
--         https://res.cloudinary.com/your_cloud/image/upload/v.../product-002.jpg}
```

To inspect image counts across all products:
```sql
SELECT id, name, array_length(images, 1) AS image_count FROM products ORDER BY id;
```

---

## Part 3 — Local PostgreSQL (alternative to Neon)

If you want to use a local database during development instead of Neon:

### 1. Install PostgreSQL

**Windows:** Download from https://www.postgresql.org/download/windows/
**Mac:** `brew install postgresql@16 && brew services start postgresql@16`
**Ubuntu:** `sudo apt install postgresql postgresql-contrib && sudo service postgresql start`

### 2. Create the database

```bash
# Open psql
psql -U postgres

# Inside psql:
CREATE DATABASE medithrex;
\q
```

### 3. Run the schema

```bash
psql -U postgres -d medithrex -f medithrex-neon.sql
```

### 4. Configure .env for local

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret

# Leave DATABASE_URL blank:
DATABASE_URL=

# Fill in local credentials:
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=medithrex
PG_USER=postgres
PG_PASSWORD=your_local_password

FRONTEND_URL=http://localhost:5173

# Cloudinary (same as Neon setup):
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=medithrex_products
```

### 5. Start

```bash
cd backend && npm install && npm run dev
```

You should see:
```
🔗 Using local PostgreSQL → localhost:5432/medithrex
✅ PostgreSQL connected
```

---

## Switching between Local and Neon

The pool automatically detects which to use:

| Scenario | What to do |
|---|---|
| Use **Neon** (cloud) | Set `DATABASE_URL=postgresql://...` in `.env` |
| Use **local** PostgreSQL | Leave `DATABASE_URL=` blank, fill `PG_HOST`, `PG_USER`, etc. |
| Use **Neon in production** (Cloud Run) | Set `DATABASE_URL` as a Secret Manager secret |

---

## Troubleshooting

| Error | Fix |
|---|---|
| `connection refused` | PostgreSQL not running — check service / Neon dashboard |
| `SSL required` | Add `?sslmode=require` to your DATABASE_URL |
| `password authentication failed` | Check PG_PASSWORD or DATABASE_URL credentials |
| `relation does not exist` | Schema not run — paste `medithrex-neon.sql` in Neon SQL Editor |
| `Image upload failed` | Check CLOUDINARY_* values in .env; ensure `npm install` ran |
| `LIMIT_FILE_COUNT` | More than 10 images selected — max is 10 per product |
