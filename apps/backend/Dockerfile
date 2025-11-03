# ============================================
# Stage 1: Builder - Build the monorepo
# ============================================
FROM node:22-alpine AS builder

# Install build dependencies for native modules (pg)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json yarn.lock ./

# Copy workspace package.json files for dependency installation
COPY apps/backend/package.json ./apps/backend/
COPY packages/zod-schemas/package.json ./packages/zod-schemas/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code for backend and shared packages
COPY apps/backend ./apps/backend
COPY packages/zod-schemas ./packages/zod-schemas
COPY packages/typescript-config ./packages/typescript-config

# Copy turborepo configuration
COPY turbo.json ./

# Build the backend (compiles TypeScript to dist/)
RUN yarn workspace @connected-repo/backend build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:22-alpine AS runtime

# Install runtime dependencies
# - dumb-init: Proper signal handling for PID 1
# - ca-certificates: SSL/TLS support for HTTPS connections
RUN apk add --no-cache dumb-init ca-certificates

# Create non-root user for security (Alpine uses addgroup/adduser)
RUN addgroup -g 1001 -S backend && \
    adduser -u 1001 -S backend -G backend

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json yarn.lock ./

# Copy workspace package.json files
COPY apps/backend/package.json ./apps/backend/
COPY packages/zod-schemas/package.json ./packages/zod-schemas/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install production dependencies only
# Note: pg is in devDependencies but required at runtime by Orchid ORM
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built backend from builder stage (includes compiled run-migrations.js)
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy shared packages source (needed for runtime imports)
COPY --from=builder /app/packages/zod-schemas ./packages/zod-schemas
COPY --from=builder /app/packages/typescript-config ./packages/typescript-config

# Copy migration source files (needed by Orchid ORM at runtime)
COPY --from=builder /app/apps/backend/src/db/migrations ./apps/backend/src/db/migrations

# Set ownership to non-root user
RUN chown -R backend:backend /app

# Switch to non-root user
USER backend

# Expose the backend port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check using the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { \
    let data = ''; \
    r.on('data', (chunk) => data += chunk); \
    r.on('end', () => { \
      const res = JSON.parse(data); \
      if (res.status === 'ok') process.exit(0); \
      process.exit(1); \
    }); \
  }).on('error', () => process.exit(1));"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Startup script with automatic smart migrations
# The migration script is idempotent - it only applies pending migrations
CMD ["sh", "-c", "\
  echo 'Running smart migration check...'; \
  node apps/backend/dist/db/run-migrations.js && \
  echo 'Starting backend server...'; \
  node apps/backend/dist/server.js \
"]
