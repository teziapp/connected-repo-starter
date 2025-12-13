## Architecture Overview

**Backend Stack:**
- Fastify + tRPC (internal APIs) + REST/OpenAPI (external APIs)
- Orchid ORM + PostgreSQL
- OpenTelemetry observability
- OAuth2 authentication (Google)
- Database-backed sessions

## Directory Structure

```
src/
├── modules/
│   ├── api-gateway/          # External REST API with OpenAPI
│   │   ├── api-gateway.router.ts       # Product API routes
│   │   ├── internal.router.ts          # Internal system routes (webhook processor)
│   │   ├── handlers/                   # Product API handlers
│   │   ├── middleware/                 # API middleware (auth, CORS, rate-limit, whitelist)
│   │   ├── utils/                      # API utils (apiKey, subscription, webhook, IP checker)
│   │   ├── constants/                  # API constants (thresholds, retry limits)
│   │   └── WEBHOOK_CRON_SETUP.md      # Webhook processor setup guide
│   ├── auth/                 # OAuth2 + session management
│   ├── journal-entries/      # Journal entry feature (replaced posts)
│   ├── users/                # User management
│   ├── teams/                # Team & team members
│   ├── subscriptions/        # API subscriptions & webhook queue
│   └── logs/                 # API product request logs
├── routers/
│   ├── app.router.ts         # Main app routes (/health, /oauth2, /internal, /trpc, /api)
│   ├── openapi.plugin.ts     # OpenAPI/Swagger setup (security schemes)
│   ├── trpc.router.ts        # tRPC router aggregation
│   └── oauth2.router.ts      # OAuth2 routes
├── db/                       # Database layer
├── configs/                  # App configuration
└── middlewares/              # Global middleware
```

## Key Rules

**Database:**
- Always use database time for date/time operations (not JS Date)
- Don't create migrations manually: `yarn db g <migration-name>`
- Template literals safe from SQL injection: `db.table.whereSql\`column = ${value}\``
- Quote column names with double quotes in raw SQL: `"maxRequests"`, not `max_requests`
- Use `timestampNumber` type (epoch milliseconds) for timestamps
- Table names: pluralized (users, sessions, journal_entries)
- Column naming: snake_case via Orchid ORM
- ID naming: descriptive (userId, teamId, not just id)
- FK naming: descriptive (authorUserId, not authorId)
- Add indexes for frequently queried columns/composites

**API Architecture:**
- **tRPC** for internal/frontend APIs (type-safe, no OpenAPI)
- **REST/OpenAPI** for external/product APIs (Swagger UI, public docs)
- fastify-zod-openapi: auto-generates OpenAPI from Zod schemas
- Use `.withTypeProvider<FastifyZodOpenApiTypeProvider>()` for OpenAPI routes

**OpenAPI Routes Pattern:**
```typescript
// 1. Define schema in @connected-repo/zod-schemas
// 2. Create handler in modules/api-gateway/handlers/
// 3. Add route in api-gateway.router.ts:
app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
  method: "POST",
  url: "/v1/resource",
  schema: {
    description: "...",
    tags: ["Product API"],
    headers: apiKeyHeaderZod,
    body: inputZod,
    response: { 201: responseZod, 401: errorResponseZod }
  } satisfies FastifyZodOpenApiSchema,
  handler: async (req, reply) => { /* ... */ }
});
```

**API Gateway Middleware Chain:**
1. `apiKeyAuthHook` - Validate x-api-key + x-team-id headers, attach team to request
2. `corsValidationHook` - Validate origin against team.allowedDomains, set CORS headers, handle preflight
3. `whitelistCheckHook` - Validate IP against team.allowedIps
4. `teamRateLimitHook` - Enforce team.rateLimitPerMinute
5. `subscriptionCheckHook` - Check active subscription + quota
6. `requestLoggerHooks` - Log request to api_product_request_logs

**API Key Generation:**
- Use `apiKeyGenerator.utils.ts` for secure key generation
- Format: `prefix_randomBytes` (e.g., `team_abc123...`)
- Hashed with scrypt before storage

**Subscription Tracking:**
- User-specific subscriptions (teamId + teamUserReferenceId + apiProductSku)
- Atomic usage tracking with `subscriptionTracker.utils.ts`
- 90% usage triggers webhook alert
- Quota enforcement per subscription

**Webhooks:**
- Queue-based async delivery via `webhook_call_queue` table
- Retry logic with exponential backoff (3 attempts max)
- Bearer token auth via `team.subscriptionAlertWebhookBearerToken`
- 90% usage threshold triggers webhook alert
- Batch processing limit: 50 webhooks per run
- Process via `/internal/process-webhooks` (secured by INTERNAL_API_SECRET)
- Constants in `api-gateway/constants/apiGateway.constants.ts`
- See `WEBHOOK_CRON_SETUP.md` for cron setup

**Security:**
- Global rate limiting: 2 req/sec, burst 5 req/10sec (production)
- Global CORS allows all origins (team-specific validation via middleware)
- Per-team CORS: validates origin against team.allowedDomains
- IP whitelist per team via team.allowedIps
- API key (scrypt hashed) + team ID header auth
- Bearer token for webhook endpoints
- Bearer token for internal routes (INTERNAL_API_SECRET)
- 404 route protection (stricter rate limiting)
- OpenAPI security schemes: apiKey, teamId headers

**Session Management:**
- Database-backed via DatabaseSessionStore
- Tracks: IP, user agent, device fingerprint, browser, OS
- Soft-delete pattern: `markedInvalidAt`
- 7-day expiry (configurable)
- Utils: `setSession()`, `clearSession()`, `invalidateAllUserSessions()`

**Error Handling:**
- tRPC Layer: errorFormatter in trpc.ts
- Error Parser: utils/errorParser.ts (DB/validation → user-friendly)
- Fastify Handler: middlewares/errorHandler.ts

**Deployment:**
- Docker support (see DEPLOYMENT.md)
- Health check: /health
- Migrations run via: `turbo db -- up`
- OpenTelemetry integration

## Adding New Features

**New API Product Endpoint:**
1. Define Zod schemas in `@connected-repo/zod-schemas`
2. Add product to `API_PRODUCTS` in `enums.zod.ts`
3. Create handler in `modules/api-gateway/handlers/`
4. Add route in `api-gateway.router.ts` with middleware chain
5. Test via Swagger UI at `/api/documentation`

**New Database Table:**
1. Create table in `modules/<feature>/tables/<entity>.table.ts`
2. Create Zod schemas in `@connected-repo/zod-schemas/<entity>.zod.ts`
3. Register in `db/db.ts`
4. Run: `yarn db g <migration_name>` then `yarn db up`

**New tRPC Endpoint:**
1. Import schema from `@connected-repo/zod-schemas`
2. Add procedure to `modules/<feature>/<feature>.trpc.ts`
3. Register in `routers/trpc.router.ts`
4. Use `protectedProcedure` for auth-required endpoints