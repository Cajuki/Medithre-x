#!/bin/bash
# =============================================================================
# Medithrex — Google Cloud Run Deployment Script
# Run from the backend/ directory: ./deploy.sh
# =============================================================================

set -e  # Exit immediately on error

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — Edit these values before running
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_ID="your-gcp-project-id"         # Your GCP project ID
REGION="us-central1"                     # Cloud Run region
SERVICE_NAME="medithrex-backend"         # Cloud Run service name
REPO_NAME="medithrex"                    # Artifact Registry repo name
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"

# ─────────────────────────────────────────────────────────────────────────────
# SECRETS — Values to store in Secret Manager
# Fill these in before first deploy, then leave blank for subsequent deploys
# ─────────────────────────────────────────────────────────────────────────────

PG_HOST=""        # e.g. 34.123.45.67 (Cloud SQL public IP) or /cloudsql/... (socket)
PG_PORT="5432"
PG_DATABASE="medithrex"
PG_USER="postgres"
PG_PASSWORD=""    # Your PostgreSQL password
JWT_SECRET=""     # Random secure string e.g. openssl rand -hex 32
FRONTEND_URL=""   # e.g. https://medithrex.co.ke or your Vercel/Firebase URL

# =============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   MEDITHREX — Cloud Run Deployment                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Check gcloud is installed ─────────────────────────────────────────────────
if ! command -v gcloud &>/dev/null; then
  echo "❌  gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# ── Set active project ────────────────────────────────────────────────────────
echo "🔧  Setting project to: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

# ── Enable required APIs ──────────────────────────────────────────────────────
echo "🔧  Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --quiet

echo "✅  APIs enabled"

# ── Create Artifact Registry repository (skip if exists) ──────────────────────
echo "🔧  Creating Artifact Registry repository..."
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Medithrex container images" \
  --quiet 2>/dev/null || echo "   (repository already exists — skipping)"

# ── Configure Docker to use gcloud auth ───────────────────────────────────────
echo "🔧  Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── Store secrets in Secret Manager ──────────────────────────────────────────
echo "🔐  Storing secrets in Secret Manager..."

store_secret() {
  local name="$1"
  local value="$2"
  if [ -n "${value}" ]; then
    echo -n "${value}" | gcloud secrets create "${name}" --data-file=- 2>/dev/null || \
    echo -n "${value}" | gcloud secrets versions add "${name}" --data-file=-
    echo "   ✅  ${name}"
  else
    echo "   ⚠️   ${name} is empty — skipping (must be set manually if first deploy)"
  fi
}

store_secret "PG_HOST"      "${PG_HOST}"
store_secret "PG_PORT"      "${PG_PORT}"
store_secret "PG_DATABASE"  "${PG_DATABASE}"
store_secret "PG_USER"      "${PG_USER}"
store_secret "PG_PASSWORD"  "${PG_PASSWORD}"
store_secret "JWT_SECRET"   "${JWT_SECRET}"
store_secret "FRONTEND_URL" "${FRONTEND_URL}"

# ── Build Docker image ────────────────────────────────────────────────────────
echo ""
echo "🐳  Building Docker image..."
docker build \
  --platform linux/amd64 \
  -t "${IMAGE_NAME}:latest" \
  -t "${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" \
  .

echo "✅  Image built: ${IMAGE_NAME}:latest"

# ── Push to Artifact Registry ─────────────────────────────────────────────────
echo ""
echo "📤  Pushing image to Artifact Registry..."
docker push "${IMAGE_NAME}:latest"
echo "✅  Image pushed"

# ── Deploy to Cloud Run ───────────────────────────────────────────────────────
echo ""
echo "🚀  Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_NAME}:latest" \
  --region="${REGION}" \
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
  --set-secrets="PG_HOST=PG_HOST:latest,PG_PORT=PG_PORT:latest,PG_DATABASE=PG_DATABASE:latest,PG_USER=PG_USER:latest,PG_PASSWORD=PG_PASSWORD:latest,JWT_SECRET=JWT_SECRET:latest,FRONTEND_URL=FRONTEND_URL:latest" \
  --quiet

# ── Get service URL ───────────────────────────────────────────────────────────
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --format="value(status.url)")

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✅  DEPLOYMENT SUCCESSFUL!                         ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║   Service:  ${SERVICE_NAME}"
echo "║   Region:   ${REGION}"
echo "║   URL:      ${SERVICE_URL}"
echo "║   Health:   ${SERVICE_URL}/api/health"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📋  Next steps:"
echo "   1. Test:  curl ${SERVICE_URL}/api/health"
echo "   2. Run DB init: add ?init=true trigger or run manually"
echo "   3. Update your frontend VITE_API_URL to: ${SERVICE_URL}"
echo ""
