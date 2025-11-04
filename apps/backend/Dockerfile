FROM node:22-alpine

# Install turbo globally for workspace pruning
RUN npm install -g turbo@^2

# Install build dependencies for native modules (required by pg)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy entire monorepo for pruning
COPY . .

# Prune the workspace to create isolated subset for @connected-repo/backend
# This creates out/json/ (package.json files) and out/full/ (source code)
RUN turbo prune @connected-repo/backend --docker

# Move pruned files to workspace root and clean up
RUN cp -r out/json/. . && \
    cp -r out/full/. . && \
    rm -rf out

# Install dependencies using pruned lockfile
RUN yarn install --frozen-lockfile

# Build the backend using Turbo (automatically builds dependencies like zod-schemas first)
RUN yarn turbo run build --filter=@connected-repo/backend

# Create non-root user for security
RUN addgroup -g 1001 -S backend && \
    adduser -S backend -u 1001

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

# Run migrations then start server
CMD ["sh", "-c", "yarn turbo db -- migrate && node apps/backend/dist/server.js"]
