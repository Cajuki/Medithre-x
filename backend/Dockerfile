# ─────────────────────────────────────────────────────────────────────────────
# Medithrex Backend — Dockerfile for Google Cloud Run
# Multi-stage build: build stage installs deps, production stage is lean
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first (better Docker layer caching)
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Create a non-root user for security (Cloud Run best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S medithrex -u 1001

# Copy dependencies from build stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=medithrex:nodejs . .

# Switch to non-root user
USER medithrex

# Cloud Run sets PORT env variable — default to 8080 if not set
ENV PORT=8080
ENV NODE_ENV=production

# Expose the port (documentation only — Cloud Run reads $PORT at runtime)
EXPOSE 8080

# Health check — Cloud Run uses this to know the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
