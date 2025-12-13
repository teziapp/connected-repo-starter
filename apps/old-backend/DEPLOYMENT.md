# Backend Deployment Guide for Coolify

This guide covers deploying the backend application to Coolify on Hetzner Server.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Docker Build Configuration](#docker-build-configuration)
- [Environment Variables](#environment-variables)
- [Migration Strategy](#migration-strategy)
- [Deployment Steps](#deployment-steps)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Coolify instance running on Hetzner Server
- PostgreSQL database (can be provisioned via Coolify)
- Domain/subdomain configured for the backend
- SSL certificate (handled by Coolify automatically)

## Database Setup

### 1. Create PostgreSQL Database in Coolify

1. Go to Coolify Dashboard → Databases
2. Click "New Database" → Select PostgreSQL
3. Configure:
   - Name: `connected-repo-db` (or your preferred name)
   - Version: PostgreSQL 16 or later
   - Username: Create a secure username
   - Password: Auto-generate a strong password
4. Deploy the database
5. Note the connection details (host, port, database name, credentials)

### 2. Database Connection Details

After deployment, Coolify provides internal connection details:
```
Host: <postgresql-service-name> (internal Docker network)
Port: 5432
Database: <your-db-name>
Username: <your-username>
Password: <your-password>
```

## Docker Build Configuration

### Dockerfile Location
The Dockerfile is located at: `apps/backend/Dockerfile`

### Build Context
**Important:** The build context must be the **monorepo root**, not the `apps/backend` directory.

In Coolify:
- **Base Directory:** `/` (or leave empty)
- **Dockerfile Location:** `apps/backend/Dockerfile`
- **Build Context:** `.` (root of repository)

### Why Root Context?
The backend depends on shared packages (`@connected-repo/zod-schemas`, `@connected-repo/typescript-config`) that live outside the backend directory. The Dockerfile copies these during build.

### Docker Image Details
The Dockerfile uses **Alpine Linux** for minimal image size:
- **Base Image:** `node:22-alpine` (~50MB base)
- **Final Image Size:** ~300-350MB (vs ~500-600MB with Debian)
- **Build Time:** Slightly longer due to native module compilation
- **Compatibility:** Fully tested with PostgreSQL driver and all dependencies

## Environment Variables

Configure the following environment variables in Coolify:

### Required Variables

```bash
# Node Environment
NODE_ENV=production

# Database Configuration
DB_HOST=<postgresql-service-internal-host>
DB_PORT=5432
DB_USER=<your-db-username>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-database-name>

# Session Secret (MUST be at least 32 characters)
SESSION_SECRET=<generate-secure-random-string-min-32-chars>

# OAuth2 - Google
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://app.yourdomain.com

# Application URLs
WEBAPP_URL=https://your-frontend-domain.com
VITE_API_URL=https://your-backend-domain.com
```

### Optional Variables

```bash
# Optional: Set custom port (default: 3000)
PORT=3000
```

### Generating SESSION_SECRET

Use one of these methods:
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online (use a secure generator)
# https://generate-secret.vercel.app/32
```

## Migration Strategy

Migrations are **automatically handled** on every deployment using a smart migration system.

### How It Works

The container runs a smart migration check on every startup:
1. **Checks for pending migrations** using Orchid ORM
2. **Only applies new migrations** that haven't been run yet
3. **Skips if database is up-to-date** (no pending migrations)
4. **Idempotent and safe** - can run multiple times without issues

This approach:
- ✅ **No manual intervention needed** - migrations run automatically
- ✅ **Safe with multiple replicas** - only pending migrations are applied
- ✅ **Zero-downtime capable** - quick check if no migrations pending
- ✅ **Logged clearly** - shows which migrations were applied

### First Deployment

Simply deploy with all environment variables configured:
1. **Set all required environment variables** (see above)
2. **Deploy the application**
3. **Check logs** - you'll see "Applied X migration(s)" or "Database is up to date"
4. **Verify** - tables should be created in your database

### Subsequent Deployments

Just deploy - migrations are handled automatically:
- **With schema changes:** New migrations are detected and applied automatically
- **Without schema changes:** Quick check confirms database is up-to-date
- **Multiple replicas:** Each replica safely checks and applies only pending migrations

### Migration Logs

Watch for these log messages on startup:

```bash
# When new migrations are applied
🔍 Checking for pending migrations...
✅ Applied 2 migration(s):
   - 0001_create_user_session_post_tables
   - 0002_add_new_fields
✅ Migration check completed successfully

# When database is up-to-date
🔍 Checking for pending migrations...
✅ Database is up to date - no pending migrations
✅ Migration check completed successfully
```

## Deployment Steps

### Step 1: Create Application in Coolify

1. Go to Coolify Dashboard → Applications
2. Click "New Application"
3. Select "Docker" as deployment type
4. Connect your Git repository
5. Configure:
   - **Branch:** `main` (or your production branch)
   - **Base Directory:** `/`
   - **Dockerfile Location:** `apps/backend/Dockerfile`
   - **Port:** `3000`
   - **Health Check Path:** `/health`

### Step 2: Configure Environment Variables

Add all required environment variables from the [Environment Variables](#environment-variables) section.

### Step 3: Configure Domain

1. In Coolify application settings → Domains
2. Add your domain: `api.yourdomain.com`
3. Coolify will automatically provision SSL via Let's Encrypt
4. Update DNS records to point to your Hetzner server IP

### Step 4: Deploy

1. Click "Deploy" in Coolify
2. Monitor build logs for errors
3. Watch startup logs for migration status
4. Wait for "Server running" message
5. Verify health check passes

### Step 5: Verify Deployment

```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-03T12:34:56.789Z"
}

# Test root endpoint
curl https://api.yourdomain.com/

# Expected response:
{
  "message": "Backend is live."
}
```

## Health Checks

### Docker Health Check

The Dockerfile includes a built-in health check:
- **Endpoint:** `GET /health`
- **Interval:** Every 30 seconds
- **Timeout:** 10 seconds
- **Start Period:** 40 seconds (allows time for migrations if enabled)
- **Retries:** 3 failed checks before marking unhealthy

### Coolify Health Check

Configure in Coolify:
- **Health Check Path:** `/health`
- **Health Check Port:** `3000`
- **Health Check Interval:** `30s`

### Manual Health Check

```bash
# Check if server is healthy
curl -f https://api.yourdomain.com/health || echo "Health check failed"

# Check Docker container health
docker ps --filter "health=healthy"
```

## Troubleshooting

### Build Failures

**Error: Cannot find module '@connected-repo/zod-schemas'**
- **Cause:** Build context is set to `apps/backend` instead of monorepo root
- **Fix:** Set build context to `.` (root) in Coolify settings

**Error: ENOENT: no such file or directory, open 'package.json'**
- **Cause:** Dockerfile location is incorrect
- **Fix:** Ensure Dockerfile location is `apps/backend/Dockerfile` and context is root

### Runtime Failures

**Error: Connection refused (PostgreSQL)**
- **Cause:** Incorrect database host or database not running
- **Fix:**
  - Use internal Docker network hostname (e.g., `postgresql-service-name`)
  - Verify database container is running in Coolify
  - Check database logs for errors

**Error: Session secret must be at least 32 characters**
- **Cause:** `SESSION_SECRET` too short or missing
- **Fix:** Generate a secure 32+ character secret (see [Generating SESSION_SECRET](#generating-session_secret))

**Error: Rate limit exceeded**
- **Cause:** Too many requests from same IP
- **Fix:** Wait 1 minute or adjust rate limits in `apps/backend/src/app.ts`

### Migration Issues

**Error: Migration failed - relation already exists**
- **Cause:** Manual table creation or database state mismatch
- **Fix:**
  - Check database for existing tables
  - Verify `schemaMigrations` table for recorded migrations
  - Drop tables if safe and let migrations recreate them
  - Or manually insert migration records into `schemaMigrations` table

**Error: Multiple replicas running same migration simultaneously**
- **Cause:** Race condition with multiple replicas starting at exact same time
- **Fix:** Orchid ORM handles this with transactions, but if you see errors:
  - Use rolling deployment strategy in Coolify (one replica at a time)
  - Add slight startup delay between replicas
  - This is rare and usually self-resolves on retry

**Migration hangs or times out**
- **Cause:** Long-running migration or database lock
- **Fix:**
  - Check database locks: `SELECT * FROM pg_locks WHERE NOT granted;`
  - Increase health check start period in Dockerfile
  - Review migration for expensive operations (add indexes concurrently)

### Health Check Failures

**Container marked unhealthy**
- Check logs: `docker logs <container-id>`
- Verify `/health` endpoint returns 200:
  ```bash
  docker exec <container-id> curl http://localhost:3000/health
  ```
- Increase `start-period` in Dockerfile if migrations take longer

**Coolify shows "unhealthy" status**
- Verify health check path is `/health` not `/healthz`
- Verify port is `3000`
- Check container logs for startup errors

## Scaling Considerations

### Horizontal Scaling (Multiple Replicas)

The application supports horizontal scaling with considerations:

1. **Session Storage:** Database-backed sessions work across replicas
2. **Rate Limiting:** Uses in-memory storage (per replica)
   - Consider Redis for shared rate limiting across replicas
3. **Migrations:** Automatically handled - safe with multiple replicas
4. **Stateless:** Application is stateless (safe to scale)

### Migration Safety with Multiple Replicas

The smart migration system is designed to be safe with multiple replicas:
- Each replica checks for pending migrations independently
- Orchid ORM uses database transactions to prevent conflicts
- If replicas start simultaneously, one will apply migrations while others wait
- Recommend using rolling deployments in Coolify for smoothest experience

### Recommended Setup

- **Development:** 1 replica
- **Production (low traffic):** 2 replicas
- **Production (high traffic):** 3+ replicas with load balancer

## Resource Requirements

### Minimum (Development)
- **CPU:** 0.5 cores
- **Memory:** 512 MB
- **Disk:** 1 GB

### Recommended (Production)
- **CPU:** 1 core
- **Memory:** 512 MB - 1 GB (Alpine uses less memory than Debian)
- **Disk:** 2 GB (Alpine images are smaller)

### Configure in Coolify
Set resource limits in Application Settings → Resources:
```yaml
cpu: "1"
memory: "1G"
```

## Monitoring

### Application Logs

View logs in Coolify:
- Application → Logs tab
- Real-time log streaming
- Search and filter capabilities

### Key Log Messages

```bash
# Successful startup
"Server running" with url "http://localhost:3000"

# Migrations applied
🔍 Checking for pending migrations...
✅ Applied 2 migration(s): ...
✅ Migration check completed successfully

# Database up-to-date
🔍 Checking for pending migrations...
✅ Database is up to date - no pending migrations
✅ Migration check completed successfully

# tRPC errors
"tRPC error" with error details

# Rate limit exceeded
"Rate limit exceeded. Please try again later."
```

### External Monitoring (Optional)

Consider adding:
- **Uptime monitoring:** UptimeRobot, Pingdom
- **Error tracking:** Sentry (OpenTelemetry already configured)
- **Performance monitoring:** New Relic, Datadog

## Security Checklist

- [ ] `SESSION_SECRET` is at least 32 characters and randomly generated
- [ ] `ALLOWED_ORIGINS` only includes trusted frontend domains
- [ ] Database credentials are strong and unique
- [ ] SSL/TLS is enabled (Coolify handles this)
- [ ] Rate limiting is enabled (default: 200 req/min)
- [ ] Running as non-root user (configured in Dockerfile)
- [ ] Environment variables are not committed to git
- [ ] Helmet security headers enabled (configured in code)
- [ ] CORS properly configured for your domains

## Backup Strategy

### Database Backups

Configure in Coolify:
1. Go to Database → Backups
2. Enable automatic backups
3. Set retention period (recommended: 7-30 days)
4. Test restore procedure

### Application Backups

- Code is version-controlled in Git (no backup needed)
- Environment variables documented in this file
- Configuration stored in Coolify (export settings periodically)

## Rollback Procedure

If deployment fails:

1. **Via Coolify:**
   - Go to Application → Deployments
   - Click "Redeploy" on previous working version

2. **Via Git:**
   - Revert commit: `git revert <commit-hash>`
   - Push to trigger new deployment

3. **Database Rollback:**
   - If migrations caused issues, restore database backup
   - Redeploy previous application version

## Support

For issues specific to:
- **Coolify:** Check Coolify docs or Discord community
- **Application:** Check repository issues or contact dev team
- **Hetzner:** Check Hetzner support or documentation

## Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Tuning Guide](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
