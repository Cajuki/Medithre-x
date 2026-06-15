# Deployment Guide — Medithrex

## Backend Deployment (Google Cloud Run)

### Prerequisites
- Google Cloud project with Cloud Run enabled
- `gcloud` CLI installed and authenticated
- Docker image already built and pushed to GCR

### Deploy Backend to Cloud Run

```bash
gcloud run deploy medithre-x \
  --image=gcr.io/famous-robot-473210-r0/medithrex:latest \
  --region=europe-west1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60 \
  --max-instances=100 \
  --set-env-vars="\
PG_HOST=localhost,\
PG_PORT=5432,\
PG_DATABASE=medithrex,\
PG_USER=postgres,\
PG_PASSWORD=your_postgres_password,\
PG_ssl=false,\
DATABASE_URL=postgresql://neondb_owner:npg_9HMBCikzcq8w@ep-sparkling-surf-absbdv2x-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require,\
JWT_SECRET=medithrex_super_secret_key_2024,\
EMAIL_HOST=smtp.gmail.com,\
EMAIL_PORT=587,\
EMAIL_SECURE=false,\
EMAIL_USER=medithrexmedicalsolutions@gmail.com,\
EMAIL_PASS=rvlhxiinvifxjnzv,\
EMAIL_FROM=Medithrex <noreply@medithrex.com>,\
FRONTEND_URL=https://medithrex.site,\
BACKEND_URL=https://api.medithrex.site,\
CLOUDINARY_CLOUD_NAME=chimzfix,\
CLOUDINARY_API_KEY=666252221762671,\
CLOUDINARY_API_SECRET=MJY5KRhZpyO39ApAzYs2mQHjCn8,\
NODE_ENV=production"
```

### Verify Deployment
```bash
# Check service status
gcloud run services describe medithre-x --region=europe-west1

# View logs
gcloud run logs read medithre-x --region=europe-west1 --limit=50

# Test health endpoint
curl https://medithre-x-180462915671.europe-west1.run.app/api/health
```

### Update Environment Variables (if needed)
```bash
gcloud run services update medithre-x \
  --region=europe-west1 \
  --update-env-vars=KEY=value
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account created
- GitHub repository connected to Vercel
- `vercel` CLI installed (optional)

### Option 1: Deploy via Vercel Web Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select GitHub repository: `Cajuki/Medithre-x`
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Set Environment Variables:
   ```
   VITE_API_URL=https://api.medithrex.site
   VITE_APP_NAME=Medithrex
   ```
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
cd frontend
vercel --prod
```

### Connect Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add domain: `medithrex.site`
3. Follow DNS configuration instructions:
   - Add Vercel nameservers to your domain registrar, OR
   - Add CNAME records pointing to `cname.vercel.com`

---

## DNS Configuration

### For medithrex.site (Frontend)
**Option A — Use Vercel Nameservers (recommended):**
- Update domain registrar to use Vercel's nameservers
- Vercel handles all DNS routing

**Option B — CNAME records:**
```
medithrex.site     CNAME   cname.vercel.com
www.medithrex.site CNAME   cname.vercel.com
```

### For api.medithrex.site (Backend)
**Create CNAME record:**
```
api.medithrex.site CNAME medithre-x-180462915671.europe-west1.run.app
```

**Verify:**
```bash
nslookup api.medithrex.site
curl https://api.medithrex.site/api/health
```

---

## Post-Deployment Verification Checklist

### Backend
- [ ] `/api/health` returns 200 with service info
- [ ] Database connection is active
- [ ] Cloudinary credentials are loaded
- [ ] Email service is working (check logs)
- [ ] CORS allows `https://medithrex.site`

### Frontend
- [ ] Homepage loads at `https://medithrex.site`
- [ ] `/products` page displays correctly
- [ ] `/contact` page form works
- [ ] Page metadata (OG tags) appear in source
- [ ] `robots.txt` is accessible
- [ ] `sitemap.xml` is accessible
- [ ] API requests route to backend correctly

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Check crawlability: `site:medithrex.site`
- [ ] Check Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- [ ] Monitor Lighthouse score

---

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://medithrex.site
BACKEND_URL=https://api.medithrex.site
```

### Frontend (.env.production)
```
VITE_API_URL=https://api.medithrex.site
VITE_APP_NAME=Medithrex
```

---

## Troubleshooting

### Backend not responding
```bash
# Check Cloud Run logs
gcloud run logs read medithre-x --region=europe-west1 --limit=100

# Verify database connection
gcloud run services describe medithre-x --region=europe-west1
```

### Frontend showing API errors
- Check `VITE_API_URL` in `.env.production`
- Verify backend CORS includes `https://medithrex.site`
- Test API endpoint directly: `curl https://api.medithrex.site/api/health`

### DNS not resolving
```bash
nslookup medithrex.site
nslookup api.medithrex.site
```

### Vercel deployment stuck
- Check build logs in Vercel Dashboard
- Ensure `frontend/` folder has `package.json` and `vite.config.js`
- Verify root directory is set to `frontend`

---

## Rollback Procedure

### Backend (Cloud Run)
```bash
# View revision history
gcloud run revisions list --service=medithre-x --region=europe-west1

# Rollback to previous revision
gcloud run services update-traffic medithre-x \
  --to-revisions REVISION_ID=100 \
  --region=europe-west1
```

### Frontend (Vercel)
1. Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

---

## Monitoring & Alerts

### Cloud Run Monitoring
- Dashboard: https://console.cloud.google.com/run
- Check CPU, memory, request latency
- Set up alerts for error rate > 5%

### Vercel Analytics
- Dashboard → Analytics tab
- Monitor Core Web Vitals
- Check deployment frequency and build times

### Uptime Monitoring (Optional)
Use a service like UptimeRobot:
- Monitor `https://medithrex.site`
- Monitor `https://api.medithrex.site/api/health`
- Alert on downtime via email/Slack
