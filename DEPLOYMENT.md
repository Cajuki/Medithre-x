# Medithrex — Google Cloud Run Deployment Guide

Complete step-by-step guide to deploying the Medithrex backend to Google Cloud Run
and the frontend to Firebase Hosting (or Vercel/Netlify).

---

## Architecture Overview

```
Users → Firebase Hosting (React frontend)
           ↓ API calls (HTTPS)
     Cloud Run (Node.js backend) ← Secret Manager (env vars)
           ↓
     Cloud SQL / Supabase / Neon (PostgreSQL)
```

---

## Prerequisites

Install these tools on your machine before starting:

```bash
# 1. Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install
gcloud --version   # must show 400+

# 2. Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
docker --version   # must show 24+

# 3. Node.js (for building frontend)
node --version     # must show 18+

# 4. Firebase CLI (for frontend hosting)
npm install -g firebase-tools
firebase --version
```

---

## Part 1 — PostgreSQL Database Setup

You need a **publicly accessible** PostgreSQL database. Choose one:

### Option A — Supabase (Recommended — Free tier available)
1. Go to https://supabase.com → New Project
2. Choose region: **eu-west-1** (Europe) or **us-east-1** (Americas)
3. Set a strong database password — **save it**
4. After project creates, go to **Settings → Database**
5. Copy the **Connection string** (use "URI" format)
6. Your values will be:
   - `PG_HOST`: something like `db.xxxxxxxxxxxx.supabase.co`
   - `PG_PORT`: `5432`
   - `PG_DATABASE`: `postgres`
   - `PG_USER`: `postgres`
   - `PG_PASSWORD`: your password
   - `PG_SSL`: `true`

### Option B — Neon (Free tier, serverless PostgreSQL)
1. Go to https://neon.tech → New Project
2. Copy the connection string from Dashboard
3. Break it into the individual PG_* variables above

### Option C — Google Cloud SQL
1. Go to GCP Console → Cloud SQL → Create Instance
2. Choose PostgreSQL 15
3. Set a root password
4. Under Connections → Add authorized network: **0.0.0.0/0** (for Cloud Run access)
5. Note the public IP address as `PG_HOST`

### Run the schema after setting up your database:
```bash
# Connect to your database and run the SQL file
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" -f medithrex.sql

# Or using npm scripts (from backend/ folder):
PG_HOST=... PG_USER=... PG_PASSWORD=... PG_DATABASE=... npm run db:init
PG_HOST=... PG_USER=... PG_PASSWORD=... PG_DATABASE=... npm run db:seed
```

---

## Part 2 — GCP Project Setup

```bash
# ── 1. Login to Google Cloud ───────────────────────────────────────────────
gcloud auth login
gcloud auth configure-docker us-central1-docker.pkg.dev  # adjust region

# ── 2. Create or select a project ─────────────────────────────────────────
gcloud projects create medithrex-prod --name="Medithrex Production"
gcloud config set project medithrex-prod

# OR use an existing project:
gcloud config set project YOUR_EXISTING_PROJECT_ID

# ── 3. Link a billing account (required for Cloud Run) ────────────────────
# Go to: https://console.cloud.google.com/billing
# Link your billing account to the project

# ── 4. Enable required APIs ────────────────────────────────────────────────
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

---

## Part 3 — Store Secrets in Secret Manager

Never put secrets in environment variables directly in your deploy command.
Store them in Secret Manager instead:

```bash
PROJECT_ID="medithrex-prod"   # your project ID

# ── Store each secret ──────────────────────────────────────────────────────
echo -n "your-db-host.supabase.co"    | gcloud secrets create PG_HOST     --data-file=-
echo -n "5432"                         | gcloud secrets create PG_PORT     --data-file=-
echo -n "postgres"                     | gcloud secrets create PG_DATABASE --data-file=-
echo -n "postgres"                     | gcloud secrets create PG_USER     --data-file=-
echo -n "YOUR_STRONG_DB_PASSWORD"      | gcloud secrets create PG_PASSWORD --data-file=-
echo -n "$(openssl rand -hex 32)"      | gcloud secrets create JWT_SECRET  --data-file=-
echo -n "https://medithrex.co.ke"     | gcloud secrets create FRONTEND_URL --data-file=-

# ── Verify secrets were created ───────────────────────────────────────────
gcloud secrets list

# ── Update a secret (if you need to change a value later) ─────────────────
echo -n "new-password" | gcloud secrets versions add PG_PASSWORD --data-file=-
```

---

## Part 4 — Build & Push Docker Image

```bash
# Navigate to the backend folder
cd medithrex/backend

# ── Create Artifact Registry repository ───────────────────────────────────
gcloud artifacts repositories create medithrex \
  --repository-format=docker \
  --location=us-central1 \
  --description="Medithrex container images"

# ── Build the image (IMPORTANT: use --platform linux/amd64 on Mac M1/M2) ──
docker build \
  --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/medithrex-prod/medithrex/medithrex-backend:latest \
  .

# ── Push to Artifact Registry ─────────────────────────────────────────────
docker push us-central1-docker.pkg.dev/medithrex-prod/medithrex/medithrex-backend:latest

# ── Verify the image is in the registry ───────────────────────────────────
gcloud artifacts docker images list us-central1-docker.pkg.dev/medithrex-prod/medithrex
```

---

## Part 5 — Deploy to Cloud Run

```bash
# ── Deploy (this creates the service on first run, updates it on subsequent runs)
gcloud run deploy medithrex-backend \
  --image=us-central1-docker.pkg.dev/medithrex-prod/medithrex/medithrex-backend:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --timeout=60 \
  --concurrency=80 \
  --set-env-vars="NODE_ENV=production,PORT=8080,PG_SSL=true" \
  --set-secrets="PG_HOST=PG_HOST:latest,PG_PORT=PG_PORT:latest,PG_DATABASE=PG_DATABASE:latest,PG_USER=PG_USER:latest,PG_PASSWORD=PG_PASSWORD:latest,JWT_SECRET=JWT_SECRET:latest,FRONTEND_URL=FRONTEND_URL:latest"

# ── Get your service URL ───────────────────────────────────────────────────
gcloud run services describe medithrex-backend \
  --region=us-central1 \
  --format="value(status.url)"

# ── Verify it's working ────────────────────────────────────────────────────
curl https://YOUR-SERVICE-URL.a.run.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Medithrex API",
  "database": "PostgreSQL",
  "db_name": "postgres"
}
```

### One-command automated deploy (after first setup):
```bash
cd medithrex/backend
# Edit PROJECT_ID and secrets at the top of the file first
./deploy.sh
```

---

## Part 6 — Deploy Frontend

### Option A — Firebase Hosting (Google, recommended with Cloud Run)

```bash
cd medithrex/frontend

# ── 1. Create .env.production with your Cloud Run URL ─────────────────────
cp .env.production.example .env.production
# Edit .env.production and set VITE_API_URL=https://YOUR-CLOUDRUN-URL.a.run.app

# ── 2. Build the frontend ──────────────────────────────────────────────────
npm install
npm run build
# Creates: frontend/dist/

# ── 3. Login to Firebase ───────────────────────────────────────────────────
firebase login

# ── 4. Initialize Firebase Hosting ────────────────────────────────────────
firebase init hosting
# Prompts:
#   ? What do you want to use as your public directory? dist
#   ? Configure as single-page app (rewrite all urls to /index.html)? YES
#   ? Set up automatic builds with GitHub? No (for now)

# ── 5. Deploy ─────────────────────────────────────────────────────────────
firebase deploy --only hosting

# Your site will be live at: https://medithrex-prod.web.app
```

### Option B — Vercel (Easiest)

```bash
npm install -g vercel
cd medithrex/frontend
vercel
# Follow prompts
# Set VITE_API_URL environment variable in Vercel dashboard
```

### Option C — Netlify

```bash
npm install -g netlify-cli
cd medithrex/frontend
npm run build
netlify deploy --prod --dir=dist
# Set VITE_API_URL in Netlify → Site settings → Environment variables
```

---

## Part 7 — Post-Deployment Checklist

```bash
BACKEND_URL="https://YOUR-SERVICE.a.run.app"

# ── 1. Health check ────────────────────────────────────────────────────────
curl ${BACKEND_URL}/api/health

# ── 2. Test registration ───────────────────────────────────────────────────
curl -X POST ${BACKEND_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@2024"}'

# ── 3. Test login ──────────────────────────────────────────────────────────
curl -X POST ${BACKEND_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medithrex.co.ke","password":"Admin@2024"}'

# ── 4. Test products endpoint ──────────────────────────────────────────────
curl ${BACKEND_URL}/api/products

# ── 5. Check Cloud Run logs for errors ────────────────────────────────────
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=medithrex-backend" \
  --limit=50 \
  --format="table(timestamp, textPayload)"
```

---

## Part 8 — Update / Redeploy

Every time you change the backend code:

```bash
cd medithrex/backend

# Rebuild and push
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/medithrex-prod/medithrex/medithrex-backend:latest .
docker push us-central1-docker.pkg.dev/medithrex-prod/medithrex/medithrex-backend:latest

# Deploy new version
gcloud run deploy medithrex-backend \
  --image=us-central1-docker.pkg.dev/medithrex-prod/medithrex/medithrex-backend:latest \
  --region=us-central1
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Container failed to start` | App crashes on boot | Check logs: `gcloud logging read ...` |
| `Could not connect to PostgreSQL` | DB not reachable | Check IP whitelist / SSL settings |
| `Permission denied on secrets` | IAM issue | Grant Secret Manager accessor role |
| `CORS error in browser` | FRONTEND_URL mismatch | Update FRONTEND_URL secret |
| `Cold start slow` | min-instances=0 | Set `--min-instances=1` |
| `Build fails on M1/M2 Mac` | ARM architecture | Add `--platform linux/amd64` to docker build |

### View logs in real time:
```bash
gcloud beta run services logs tail medithrex-backend --region=us-central1
```

### Rollback to previous revision:
```bash
# List revisions
gcloud run revisions list --service=medithrex-backend --region=us-central1

# Route all traffic to a previous revision
gcloud run services update-traffic medithrex-backend \
  --region=us-central1 \
  --to-revisions=medithrex-backend-00001-abc=100
```

---

## Estimated Monthly Costs (Cloud Run Free Tier)

Cloud Run has a **generous free tier**:

| Resource | Free per month | Typical usage |
|---|---|---|
| Requests | 2 million | Low-medium traffic: free |
| CPU | 180,000 vCPU-seconds | Small app: free |
| Memory | 360,000 GB-seconds | Small app: free |
| Network egress | 1 GB | Usually free |

For a small hospital equipment platform, **the backend will likely run for free** on Cloud Run.

---

## Summary — Quick Reference

```bash
# PROJECT SETUP (once)
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# STORE SECRETS (once)
echo -n "VALUE" | gcloud secrets create SECRET_NAME --data-file=-

# BUILD + DEPLOY (every code change)
cd backend
docker build --platform linux/amd64 -t IMAGE_URL .
docker push IMAGE_URL
gcloud run deploy medithrex-backend --image=IMAGE_URL --region=us-central1

# CHECK HEALTH
curl https://YOUR-SERVICE.a.run.app/api/health
```
