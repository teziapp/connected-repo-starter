# Migration Plan: Fastify + tRPC → oRPC

> **Migration Strategy**: Phase-wise incremental migration from `@apps/old-backend` (Fastify + tRPC) to `@apps/backend` (oRPC)

## Table of Contents

1. [Overview](#overview)
2. [Migration Phases](#migration-phases)
3. [Technical Mapping](#technical-mapping)
4. [Detailed Phase Plans](#detailed-phase-plans)
5. [Testing Strategy](#testing-strategy)
6. [Rollback Strategy](#rollback-strategy)
7. [Post-Migration Tasks](#post-migration-tasks)

---

## Overview

### Current Architecture (old-backend)

**Stack:**
- **Framework**: Fastify 5.6.1
- **RPC Layer**: tRPC with `@trpc/server`
- **OpenAPI**: `fastify-zod-openapi` for external REST APIs
- **Database**: Orchid ORM 1.57.6 + PostgreSQL
- **Auth**: OAuth2 (Google) + database-backed sessions
- **Observability**: OpenTelemetry (custom setup)
- **Security**: `@fastify/helmet`, `@fastify/cors`, `rate-limiter-flexible`

**Key Features:**
- Session management with device fingerprinting
- Multi-tier rate limiting (global, per-endpoint, per-team)
- API Gateway with OpenAPI documentation
- OAuth2 authentication flow
- Webhook queue system
- API key authentication for external APIs
- Team-based CORS and IP whitelisting

### Target Architecture (backend)

**Stack:**
- **Framework**: Node.js HTTP server
- **RPC Layer**: oRPC `@orpc/server` 1.12.1
- **OpenAPI**: `@orpc/openapi` (built-in)
- **Database**: Orchid ORM 1.57.6 + PostgreSQL (unchanged)
- **Observability**: `@orpc/otel`
- **Security**: oRPC plugins (CORS, CSRF, rate limiting)
- **Logging**: `@orpc/experimental-pino`

**Benefits:**
- End-to-end type safety with OpenAPI compliance
- Unified RPC and OpenAPI in one framework
- Native support for streaming, SSE, WebSockets
- Better tree-shaking and bundle optimization
- Contract-first development option
- Multi-runtime support (Node, Bun, Deno, Cloudflare Workers)

---

## Migration Phases

### Phase 0: Foundation & Setup ✅ **COMPLETE**
- [x] Install oRPC packages
- [x] Create basic server setup
- [x] Setup example router with procedures
- [x] Configure environment variables
- [x] Setup database connection (all tables registered)
- [x] Copy database migrations from old-backend
- [x] Copy database table definitions

### Phase 1: Core Infrastructure ✅ **COMPLETE**
**Goal**: Establish core oRPC infrastructure with context, middleware, and error handling

**Deliverables:**
1. ✅ Context system (session, headers, user) - `AppContext`, `AuthenticatedContext` defined
2. ✅ Base procedure types (public, protected, sensitive) - All procedures created
3. ✅ Error handling infrastructure - `orpcErrorParser` created, client interceptors configured
4. ⚠️ Rate limiting setup - Configured but disabled (throws errors, needs investigation)
5. ✅ CORS and security plugins - Configured in server.ts (CORS, CSRF, strict GET)
6. ✅ Session loading middleware - Integrated directly into publicProcedure

### Phase 2: Authentication & Session Management ✅ **COMPLETE**
**Goal**: Migrate session management and OAuth2 authentication

**Deliverables:**
1. ✅ Better-auth integration - Using `better-auth` library instead of manual session management
2. ✅ Auth middleware - Validates authentication and injects user context
3. ✅ OAuth2 flow (Google) - Better-auth handles OAuth through `/api/auth/*` endpoints
4. ✅ Auth procedures (getSessionInfo, logout) - Implemented in `auth.router.ts`
5. ✅ Device fingerprinting utilities - Integrated into auth middleware

**Implementation Notes:**
- Switched from manual session management to `better-auth` library
- Server routes `/api/auth/*` to better-auth handler using `toNodeHandler`
- Auth middleware extracts client info (browser, OS, device) and device fingerprint
- Header conversion utilities created to bridge Node.js headers and Web Headers API

### Phase 3: Core Modules - Users & Journal Entries ✅ **COMPLETE**
**Goal**: Migrate primary feature modules

**Deliverables:**
1. ✅ Users module (CRUD operations) - `getAll`, `getById`, `create`
2. ✅ Journal entries module - `getAll`, `getById`, `create`, `getByUser`, `delete`
3. ✅ Prompts module - `getAllActive`, `getRandomActive`, `getById`, `getByCategory`
4. ✅ Protected procedure implementations - All modules use proper authorization

**Implementation Notes:**
- All procedures follow pattern: export individual procedures, then group into router object
- Authorization checks implemented (journal entries check user owns the entry)
- Proper error handling with `ORPCError` and HTTP status codes

### Phase 4: API Gateway & OpenAPI (Week 3-4)
**Goal**: Migrate external REST API with OpenAPI documentation

**Deliverables:**
1. OpenAPI handler setup with `@orpc/openapi`
2. API key authentication middleware
3. Team-based CORS validation
4. IP whitelist middleware
5. Per-team rate limiting
6. Request logging
7. Subscription checking
8. OpenAPI spec generation

### Phase 5: Advanced Features (Week 4-5)
**Goal**: Migrate webhook system, teams, and subscriptions

**Deliverables:**
1. Teams module
2. Subscriptions module
3. Webhook queue system
4. Internal API routes
5. Webhook processor

### Phase 6: Observability & Production Readiness (Week 5-6)
**Goal**: Setup monitoring, testing, and deployment

**Deliverables:**
1. OpenTelemetry integration with `@orpc/otel`
2. Structured logging with Pino
3. Health check endpoints
4. Error tracking and alerting
5. Performance monitoring
6. Docker configuration update
7. PM2 ecosystem update

### Phase 7: Testing & Validation (Week 6-7)
**Goal**: Comprehensive testing and frontend integration

**Deliverables:**
1. Unit tests for procedures
2. Integration tests for workflows
3. Frontend client migration (`@orpc/client`)
4. End-to-end testing
5. Load testing

### Phase 8: Cutover & Deprecation (Week 7-8)
**Goal**: Switch to new backend and deprecate old

**Deliverables:**
1. Deploy new backend to staging
2. Run parallel testing (old vs new)
3. Migrate production traffic
4. Monitor and fix issues
5. Archive old-backend

---

## Technical Mapping

### 1. Server Setup

**Old (Fastify):**
```typescript
// apps/old-backend/src/server.ts
const app = fastify({ logger: loggerConfig[env.NODE_ENV] })
await app.register(cors, { origin: true })
await app.register(helmet)
await app.register(rateLimit, { global: true, max: 200 })
await app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  router: appTrpcRouter
})
await server.listen({ port: 3000, host: "0.0.0.0" })
```

**New (oRPC):**
```typescript
// apps/backend/src/server.ts
const handler = new RPCHandler(router, {
  plugins: [
    new CORSPlugin({ origin: [...allowedOrigins] }),
    new RatelimitHandlerPlugin(),
    new LoggingHandlerPlugin({ logger }),
    new SimpleCsrfProtectionHandlerPlugin(),
  ],
  interceptors: [onError((error) => logger.error(error))],
})

const server = createServer(async (req, res) => {
  await handler.handle(req, res, { context: { headers: req.headers } })
})
server.listen(3000, '0.0.0.0')
```

**Migration Notes:**
- Replace `fastify` with Node.js `createServer`
- Replace Fastify plugins with oRPC plugins
- Use `RPCHandler` for RPC routes
- Use `OpenAPIHandler` for REST/OpenAPI routes (can run both simultaneously)

---

### 2. Context & Middleware

**Old (tRPC):**
```typescript
// apps/old-backend/src/trpc.ts
export const createTRPCContext = (input: CreateFastifyContextOptions) => {
  const user = input.req.session.user
  return {
    req: input.req,
    res: input.res,
    user: user,
  }
}

const isAuthenticatedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx: { ...ctx, user: ctx.user as SessionUser } })
})
```

**New (oRPC):**
```typescript
// apps/backend/src/procedures/public.procedure.ts
import { os, ORPCError } from '@orpc/server'
import type { IncomingHttpHeaders } from 'node:http'
import type { SessionUser } from '@backend/types'

// Define context type
export interface AppContext {
  headers: IncomingHttpHeaders
  session?: {
    user?: SessionUser
  }
}

// Base procedure with context
export const publicProcedure = os
  .$context<AppContext>()
  .errors({
    INPUT_VALIDATION_FAILED: { status: 422 },
    OUTPUT_VALIDATION_FAILED: { status: 422 },
  })

// Protected procedure with auth middleware
export const protectedProcedure = publicProcedure
  .use(({ context, next }) => {
    if (!context.session?.user?.userId) {
      throw new ORPCError('UNAUTHORIZED', {
        status: 401,
        message: 'User is not authenticated'
      })
    }
    return next({
      context: {
        ...context,
        user: context.session.user as SessionUser & { userId: string }
      }
    })
  })
```

**Migration Notes:**
- Replace `createTRPCContext` with context injection in handler
- Convert tRPC middleware to oRPC `.use()` chains
- Replace `TRPCError` with `ORPCError`
- Define context types explicitly with `.$context<T>()`

---

### 3. Procedures (Queries & Mutations)

**Old (tRPC):**
```typescript
// apps/old-backend/src/modules/journal-entries/journal_entries.trpc.ts
export const journalEntriesRouterTrpc = trpcRouter({
  getAll: protectedProcedure.query(async ({ ctx: { user: { userId } } }) => {
    return await db.journalEntries
      .select("*", { author: (t) => t.author.selectAll() })
      .where({ authorUserId: userId })
  }),

  create: protectedProcedure
    .input(journalEntryCreateInputZod)
    .mutation(async ({ input, ctx: { user } }) => {
      return await db.journalEntries.create({
        authorUserId: user.userId,
        ...input,
      })
    }),
})
```

**New (oRPC):**
```typescript
// apps/backend/src/modules/journal-entries/journal-entries.router.ts
import { protectedProcedure } from '@backend/procedures/protected.procedure'
import { journalEntryCreateInputZod } from '@connected-repo/zod-schemas/journal_entry.zod'

export const getAll = protectedProcedure
  .handler(async ({ context: { user: { userId } } }) => {
    return await db.journalEntries
      .select("*", { author: (t) => t.author.selectAll() })
      .where({ authorUserId: userId })
  })

export const create = protectedProcedure
  .input(journalEntryCreateInputZod)
  .handler(async ({ input, context: { user } }) => {
    return await db.journalEntries.create({
      authorUserId: user.userId,
      ...input,
    })
  })

// Export as router
export const journalEntriesRouter = {
  getAll,
  create,
  getById,
  delete,
}
```

**Migration Notes:**
- Replace `.query()` and `.mutation()` with `.handler()`
- oRPC doesn't distinguish queries/mutations at procedure level
- Use HTTP methods in OpenAPI routes for REST semantics
- Access context via `context` parameter (not `ctx`)

---

### 4. Router Organization

**Old (tRPC):**
```typescript
// apps/old-backend/src/routers/trpc.router.ts
export const appTrpcRouter = trpcRouter({
  hello: publicProcedure.query(async () => "Hello from tRPC"),
  auth: authRouterTrpc,
  journalEntries: journalEntriesRouterTrpc,
  users: usersRouterTrpc,
})

export type AppTrpcRouter = typeof appTrpcRouter
```

**New (oRPC):**
```typescript
// apps/backend/src/router.ts
import { RouterClient } from '@orpc/server'
import { authRouter } from './modules/auth/auth.router'
import { journalEntriesRouter } from './modules/journal-entries/journal-entries.router'
import { usersRouter } from './modules/users/users.router'

export const router = {
  hello: publicProcedure.handler(async () => "Hello from oRPC"),
  auth: authRouter,
  journalEntries: journalEntriesRouter,
  users: usersRouter,
}

export type BackendRouter = RouterClient<typeof router>
```

**Migration Notes:**
- Replace `trpcRouter()` wrapper with plain object
- Export `RouterClient<typeof router>` for client type inference
- Nested routers work the same way
- No need for `createCallerFactory` (oRPC has built-in server-side calls)

---

### 5. Rate Limiting

**Old (tRPC + rate-limiter-flexible):**
```typescript
// apps/old-backend/src/trpc.ts
const rateLimiters = {
  moderate: new BurstyRateLimiter(
    new RateLimiterMemory({ points: 20, duration: 60 }),
    new RateLimiterMemory({ keyPrefix: "burst", points: 5, duration: 120 }),
  ),
}

export const moderateRateLimit = t.middleware(async ({ ctx, next }) => {
  const ip = getClientIpAddress(ctx.req)
  try {
    await rateLimiters.moderate.consume(ip)
    return next()
  } catch {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
  }
})

// Usage
getSessionInfo: publicProcedure.use(moderateRateLimit).query(...)
```

**New (oRPC):**
```typescript
// apps/backend/src/procedures/public.procedure.ts
import { MemoryRatelimiter } from '@orpc/experimental-ratelimit/memory'
import { createRatelimitMiddleware } from '@orpc/experimental-ratelimit'

const globalLimiter = new MemoryRatelimiter({
  maxRequests: 10,
  window: 60000, // 60 seconds
})

const moderateLimiter = new MemoryRatelimiter({
  maxRequests: 20,
  window: 60000,
})

export const moderateRateLimit = createRatelimitMiddleware({
  limiter: moderateLimiter,
  key: ({ context }) => getClientIpAddress(context.headers),
})

// Usage
export const getSessionInfo = publicProcedure
  .use(moderateRateLimit)
  .handler(...)
```

**Migration Notes:**
- Use `@orpc/experimental-ratelimit` instead of `rate-limiter-flexible`
- oRPC provides `MemoryRatelimiter` and adapters for Redis, etc.
- Apply rate limiting at handler level (via `RatelimitHandlerPlugin`) or procedure level
- Can use existing `rate-limiter-flexible` if needed by wrapping in oRPC middleware

---

### 6. Session Management

**Old (Fastify Session):**
```typescript
// apps/old-backend/src/app.ts
const sessionStore = new DatabaseSessionStore(db, cookieMaxAge)

app.register(session, {
  secret: env.SESSION_SECRET,
  store: sessionStore,
  cookie: { secure: isProd, httpOnly: true, maxAge: cookieMaxAge },
})

// Access in context
export const createTRPCContext = (input) => {
  const user = input.req.session.user
  return { req: input.req, user }
}
```

**New (oRPC):**
```typescript
// apps/backend/src/middlewares/session.middleware.ts
import { DatabaseSessionStore } from '@backend/modules/auth/session.store'
import { parseCookie, setCookie } from '@orpc/server/plugins'

const sessionStore = new DatabaseSessionStore(db, cookieMaxAge)

export const sessionMiddleware = os.use(async ({ context, next }) => {
  const cookies = parseCookie(context.headers.cookie || '')
  const sessionId = cookies['connect.sid']

  let session = null
  if (sessionId) {
    session = await sessionStore.get(sessionId)
  }

  return next({
    context: {
      ...context,
      session,
      sessionId,
    }
  })
})

// Usage in server
const server = createServer(async (req, res) => {
  const result = await handler.handle(req, res, {
    context: {
      headers: req.headers,
      // Session will be injected by middleware
    }
  })
})
```

**Migration Strategy:**
1. **Reuse existing `DatabaseSessionStore`** - No changes needed to session storage logic
2. **Create session middleware** - Extract session from cookie, load from DB, inject into context
3. **Cookie management** - Use oRPC cookie helpers or `Set-Cookie` headers manually
4. **Session utilities** - Keep `setSession()`, `clearSession()` but adapt to oRPC response handling

**Note**: oRPC doesn't have built-in session management like Fastify. We'll need to:
- Parse cookies manually from headers
- Load session from DB in middleware
- Set cookies via response headers
- Consider using `@fastify/cookie` style utilities or implementing custom helpers

---

### 7. Error Handling

**Old (tRPC):**
```typescript
// apps/old-backend/src/trpc.ts
const t = initTRPC.context<TrpcContext>().create({
  errorFormatter: ({ shape, error }) => {
    const customError = trpcErrorParser(error)
    return {
      ...shape,
      message: customError.message,
      data: {
        ...shape.data,
        code: customError.code,
        details: customError.details,
        userFriendlyMessage: customError.userFriendlyMessage,
      },
    }
  },
})
```

**New (oRPC):**
```typescript
// apps/backend/src/server.ts
import { onError, ORPCError, ValidationError } from '@orpc/server'
import { ZodError } from 'zod'

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      logger.error(error)
      // Transform errors here if needed
    }),
  ],
  clientInterceptors: [
    onError((error) => {
      // Handle validation errors
      if (
        error instanceof ORPCError &&
        error.code === 'BAD_REQUEST' &&
        error.cause instanceof ValidationError
      ) {
        const zodError = new ZodError(error.cause.issues)
        throw new ORPCError('INPUT_VALIDATION_FAILED', {
          status: 422,
          message: prettifyError(zodError),
          data: flattenError(zodError),
        })
      }

      // Parse database errors
      const parsedError = orpcErrorParser(error)
      throw new ORPCError(parsedError.code, {
        status: parsedError.httpStatus,
        message: parsedError.message,
        data: parsedError.details,
      })
    }),
  ],
})
```

**Migration Notes:**
- Replace `errorFormatter` with `clientInterceptors` using `onError`
- Port `trpcErrorParser` to `orpcErrorParser` for DB errors
- Use `ORPCError` constructor with custom codes
- Define custom error codes in procedures via `.errors()`

---

### 8. OpenAPI / External REST APIs

**Old (Fastify + fastify-zod-openapi):**
```typescript
// apps/old-backend/src/modules/api-gateway/api-gateway.router.ts
app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
  method: "POST",
  url: "/v1/journal_entry/create",
  schema: {
    description: "Save a journal entry",
    tags: ["Product API"],
    headers: apiKeyHeaderZod,
    body: journalEntryCreateInputZod,
    response: {
      201: journalEntrySelectAllZod,
      401: errorResponseZod,
    },
  } satisfies FastifyZodOpenApiSchema,
  preHandler: [
    corsValidationHook,
    apiKeyAuthHook,
    ipWhitelistCheckHook,
    teamRateLimitHook,
    subscriptionCheckHook,
  ],
  handler: saveJournalEntryHandler,
})
```

**New (oRPC + @orpc/openapi):**
```typescript
// apps/backend/src/modules/api-gateway/api-gateway.router.ts
import { os } from '@orpc/server'
import { OpenAPIHandler, OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'

// Define procedure with OpenAPI metadata
export const createJournalEntry = os
  .route({ method: 'POST', path: '/v1/journal_entry/create' })
  .use(corsValidationMiddleware)
  .use(apiKeyAuthMiddleware)
  .use(ipWhitelistMiddleware)
  .use(teamRateLimitMiddleware)
  .use(subscriptionCheckMiddleware)
  .input(journalEntryCreateInputZod)
  .output(journalEntrySelectAllZod)
  .meta({
    openapi: {
      description: "Save a journal entry",
      tags: ["Product API"],
    }
  })
  .handler(saveJournalEntryHandler)

// Setup OpenAPI handler
const openapiHandler = new OpenAPIHandler(apiGatewayRouter, {
  schemaConverters: [new ZodToJsonSchemaConverter()],
  prefix: '/api',
})

// Generate OpenAPI spec
const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

const spec = await generator.generate(apiGatewayRouter, {
  info: {
    title: 'Product API',
    version: '1.0.0',
  },
  servers: [{ url: env.VITE_API_URL }],
})
```

**Middleware Chain Migration:**

```typescript
// Old: Fastify preHandler hooks
preHandler: [corsValidationHook, apiKeyAuthHook, ...]

// New: oRPC middleware chain
export const apiProcedure = os
  .use(corsValidationMiddleware)
  .use(apiKeyAuthMiddleware)
  .use(ipWhitelistMiddleware)
  .use(teamRateLimitMiddleware)
  .use(subscriptionCheckMiddleware)
  .use(requestLoggerMiddleware)
```

**Migration Notes:**
- Use `.route({ method, path })` to define REST endpoints
- Chain middleware with `.use()` instead of `preHandler`
- Use `.meta({ openapi: {...} })` for OpenAPI metadata
- Generate spec with `OpenAPIGenerator`
- Serve spec at `/api/documentation` or similar
- Consider running both `RPCHandler` (for RPC) and `OpenAPIHandler` (for REST) on different routes

---

### 9. OAuth2 Authentication

**Old (Fastify + @fastify/oauth2):**
```typescript
// apps/old-backend/src/modules/auth/oauth2/google-oauth2.plugin.ts
app.register(oauthPlugin, {
  name: "google",
  scope: ["profile", "email"],
  credentials: {
    client: { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: "/oauth2/google",
  callbackUri: `${env.VITE_API_URL}/oauth2/google/callback`,
})

app.get("/oauth2/google/callback", async (req, reply) => {
  const { token } = await app.google.getAccessTokenFromAuthorizationCodeFlow(req)
  const userInfo = await fetchGoogleUserInfo(token.access_token)
  await setSession(req, userInfo)
  reply.redirect(env.VITE_FRONTEND_URL)
})
```

**New (oRPC + manual OAuth2):**
```typescript
// apps/backend/src/modules/auth/oauth2/google-oauth2.handler.ts
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.VITE_API_URL}/oauth2/google/callback`
)

// Start OAuth flow
export const googleAuthStart = os
  .handler(async () => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
    })
    return { redirectUrl: url }
  })

// OAuth callback
export const googleAuthCallback = os
  .input(z.object({ code: z.string() }))
  .handler(async ({ input }) => {
    const { tokens } = await oauth2Client.getToken(input.code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    // Create session (need to handle cookie setting manually)
    const sessionId = await createSession(userInfo)

    return {
      redirectUrl: env.VITE_FRONTEND_URL,
      sessionId,
    }
  })
```

**Migration Strategy:**
1. **Remove `@fastify/oauth2` dependency** - No direct oRPC equivalent
2. **Use `googleapis` package** - More flexible OAuth2 implementation
3. **Manual redirect handling** - Return redirect URLs instead of using `reply.redirect()`
4. **Session cookie management** - Handle `Set-Cookie` headers manually
5. **Consider HTTP handler wrapping** - Wrap OAuth routes in raw HTTP handler for redirects

**Alternative**: Keep a minimal Fastify instance JUST for OAuth2 routes, proxy from oRPC

---

### 10. OpenTelemetry Integration

**Old (Custom setup):**
```typescript
// apps/old-backend/src/opentelemetry.ts
// Custom tracer setup with manual spans
```

**New (oRPC built-in):**
```typescript
// apps/backend/src/server.ts
import { OTelPlugin } from '@orpc/otel'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'

// Setup OpenTelemetry SDK
const sdk = new NodeSDK({
  serviceName: 'backend',
  instrumentations: [new HttpInstrumentation()],
  // ... other config
})
sdk.start()

// Add OTel plugin to handler
const handler = new RPCHandler(router, {
  plugins: [
    new OTelPlugin({
      // Auto-traces all procedures
      includeInput: true,
      includeOutput: false, // Don't log sensitive data
    }),
  ],
})
```

**Migration Notes:**
- Use `@orpc/otel` for automatic procedure tracing
- Keep existing OpenTelemetry SDK setup
- Remove manual span creation in tRPC procedures
- Configure attribute filtering to exclude sensitive data

---

## Detailed Phase Plans

### Phase 1: Core Infrastructure

**Tasks:**

1. **Setup Database Connection**
   - [ ] Copy `src/db/` from old-backend to backend
   - [ ] Copy `src/configs/` for environment config
   - [ ] Copy `src/utils/` for shared utilities
   - [ ] Test database connection

2. **Context System**
   - [ ] Define `AppContext` interface
   - [ ] Create session middleware for context injection
   - [ ] Create user middleware for auth context
   - [ ] Test context propagation

3. **Base Procedures**
   ```typescript
   // src/procedures/public.procedure.ts
   export const publicProcedure = os
     .$context<AppContext>()
     .use(sessionMiddleware)
     .errors({ INPUT_VALIDATION_FAILED: { status: 422 } })

   // src/procedures/protected.procedure.ts
   export const protectedProcedure = publicProcedure
     .use(authMiddleware)

   // src/procedures/sensitive.procedure.ts
   export const sensitiveProcedure = protectedProcedure
     .use(sessionSecurityMiddleware(SessionSecurityLevel.STRICT))
   ```

4. **Error Handling**
   - [ ] Create `orpcErrorParser` (port from `trpcErrorParser`)
   - [ ] Setup `clientInterceptors` with error transformation
   - [ ] Define custom error codes
   - [ ] Test error responses

5. **Rate Limiting**
   - [ ] Setup global rate limiter with `@orpc/experimental-ratelimit`
   - [ ] Create moderate/strict rate limit middleware
   - [ ] Test rate limiting behavior

6. **CORS & Security**
   - [ ] Configure `CORSPlugin` with allowed origins
   - [ ] Add `SimpleCsrfProtectionHandlerPlugin`
   - [ ] Add `StrictGetMethodPlugin`
   - [ ] Test CORS behavior

**Testing:**
- [ ] Write integration tests for context injection
- [ ] Test error handling with various error types
- [ ] Test rate limiting with concurrent requests
- [ ] Test CORS with different origins

---

### Phase 2: Authentication & Session Management

**Tasks:**

1. **Database Session Store**
   - [ ] Copy `DatabaseSessionStore` class from old-backend
   - [ ] Adapt to work with oRPC context (no Fastify req/res)
   - [ ] Test session CRUD operations

2. **Session Middleware**
   ```typescript
   // src/middlewares/session.middleware.ts
   export const sessionMiddleware = os.use(async ({ context, next }) => {
     const cookies = parseCookie(context.headers.cookie || '')
     const sessionId = cookies['connect.sid']

     let session = null
     if (sessionId) {
       session = await sessionStore.get(sessionId)
       // Touch session to extend expiry
       await sessionStore.touch(sessionId)
     }

     return next({
       context: {
         ...context,
         session,
         sessionId,
       }
     })
   })
   ```

3. **Session Utilities**
   - [ ] Port `setSession()` - adapt to set `Set-Cookie` header
   - [ ] Port `clearSession()` - adapt to clear cookie
   - [ ] Port `invalidateAllUserSessions()`
   - [ ] Test session lifecycle

4. **OAuth2 Flow**
   - [ ] Implement Google OAuth2 start endpoint
   - [ ] Implement OAuth2 callback handler
   - [ ] Handle redirect with session cookie
   - [ ] Test full OAuth2 flow

   **Decision Point**:
   - **Option A**: Use `googleapis` package for OAuth2 (recommended)
   - **Option B**: Keep minimal Fastify instance for OAuth2 only
   - **Option C**: Implement OAuth2 manually with HTTP redirects

5. **Auth Router**
   ```typescript
   // src/modules/auth/auth.router.ts
   export const authRouter = {
     getSessionInfo: publicProcedure
       .use(moderateRateLimit)
       .handler(async ({ context }) => {
         if (context.session?.user) {
           return {
             hasSession: true,
             user: context.session.user,
             isRegistered: !!context.session.user.userId,
           }
         }
         return { hasSession: false, user: null, isRegistered: false }
       }),

     logout: publicProcedure
       .handler(async ({ context }) => {
         await clearSession(context.sessionId)
         return { success: true }
       }),
   }
   ```

6. **Device Fingerprinting**
   - [ ] Copy `request-metadata.utils.ts`
   - [ ] Copy `sessionSecurity.middleware.ts` logic
   - [ ] Adapt to oRPC middleware
   - [ ] Test fingerprint validation

**Testing:**
- [ ] Test session creation and retrieval
- [ ] Test session expiry
- [ ] Test OAuth2 flow end-to-end
- [ ] Test concurrent session invalidation
- [ ] Test device fingerprint validation

---

### Phase 3: Core Modules

**Tasks:**

1. **Users Module**
   ```typescript
   // src/modules/users/users.router.ts
   export const getAll = protectedProcedure
     .handler(async () => {
       return await db.users.all()
     })

   export const create = publicProcedure
     .use(strictRateLimit)
     .input(userCreateInputZod)
     .handler(async ({ input }) => {
       return await db.users.create(input)
     })

   export const usersRouter = {
     getAll,
     create,
     getById,
     update,
     delete,
   }
   ```

2. **Journal Entries Module**
   - [ ] Convert all procedures from `journal_entries.trpc.ts`
   - [ ] Test CRUD operations
   - [ ] Test authorization (user can only access own entries)

3. **Prompts Module**
   - [ ] Convert all procedures from `prompts.trpc.ts`
   - [ ] Test CRUD operations

4. **Main Router Assembly**
   ```typescript
   // src/router.ts
   export const router = {
     hello: publicProcedure.handler(async () => "Hello from oRPC"),
     auth: authRouter,
     users: usersRouter,
     journalEntries: journalEntriesRouter,
     prompts: promptsRouter,
   }

   export type BackendRouter = RouterClient<typeof router>
   ```

**Testing:**
- [ ] Test each CRUD operation
- [ ] Test authorization logic
- [ ] Test input validation
- [ ] Test error cases (not found, duplicate, etc.)

---

### Phase 4: API Gateway & OpenAPI

**Tasks:**

1. **OpenAPI Handler Setup**
   ```typescript
   // src/server.ts - Dual handlers
   const rpcHandler = new RPCHandler(router, { ... })
   const openapiHandler = new OpenAPIHandler(apiGatewayRouter, {
     schemaConverters: [new ZodToJsonSchemaConverter()],
   })

   const server = createServer(async (req, res) => {
     // Route to appropriate handler
     if (req.url?.startsWith('/api/')) {
       const result = await openapiHandler.handle(req, res, { context: { ... } })
       if (!result.matched) {
         res.statusCode = 404
         res.end('Not found')
       }
     } else if (req.url?.startsWith('/rpc/')) {
       const result = await rpcHandler.handle(req, res, { context: { ... } })
       if (!result.matched) {
         res.statusCode = 404
         res.end('Not found')
       }
     } else {
       // Health check, docs, etc.
     }
   })
   ```

2. **API Key Authentication Middleware**
   ```typescript
   // src/modules/api-gateway/middleware/apiKeyAuth.middleware.ts
   export const apiKeyAuthMiddleware = os.use(async ({ context, next }) => {
     const apiKey = context.headers['x-api-key']
     const teamId = context.headers['x-team-id']

     if (!apiKey || !teamId) {
       throw new ORPCError('UNAUTHORIZED', {
         status: 401,
         message: 'Missing API key or team ID'
       })
     }

     const team = await validateApiKey(apiKey, teamId)
     if (!team) {
       throw new ORPCError('UNAUTHORIZED', {
         status: 401,
         message: 'Invalid API key'
       })
     }

     return next({ context: { ...context, team } })
   })
   ```

3. **Team-Based CORS Middleware**
   ```typescript
   // src/modules/api-gateway/middleware/corsValidation.middleware.ts
   export const corsValidationMiddleware = os.use(async ({ context, next }) => {
     const origin = context.headers.origin
     const team = context.team

     if (!team) {
       throw new ORPCError('FORBIDDEN', { message: 'No team context' })
     }

     if (!team.allowedDomains.includes(origin)) {
       throw new ORPCError('FORBIDDEN', { message: 'Origin not allowed' })
     }

     // Will need to set CORS headers in response
     return next()
   })
   ```

4. **IP Whitelist Middleware**
   - [ ] Port `ipWhitelistCheckHook` to oRPC middleware
   - [ ] Test IP validation

5. **Per-Team Rate Limiting**
   ```typescript
   // src/modules/api-gateway/middleware/teamRateLimit.middleware.ts
   export const teamRateLimitMiddleware = os.use(async ({ context, next }) => {
     const team = context.team
     const limiter = getOrCreateLimiter(team.teamId, team.rateLimitPerMinute)

     try {
       await limiter.consume(team.teamId)
       return next()
     } catch {
       throw new ORPCError('TOO_MANY_REQUESTS', {
         status: 429,
         message: 'Team rate limit exceeded'
       })
     }
   })
   ```

6. **Subscription Check Middleware**
   - [ ] Port `subscriptionCheckHook`
   - [ ] Port `subscriptionTracker.utils.ts`
   - [ ] Test quota enforcement

7. **Request Logger Middleware**
   ```typescript
   // src/modules/api-gateway/middleware/requestLogger.middleware.ts
   export const requestLoggerMiddleware = os.use(async ({ context, next }) => {
     const startTime = Date.now()

     try {
       const result = await next()

       // Log successful request
       await db.apiProductRequestLogs.create({
         teamId: context.team.teamId,
         status: 'success',
         duration: Date.now() - startTime,
         // ... other fields
       })

       return result
     } catch (error) {
       // Log failed request
       await db.apiProductRequestLogs.create({
         teamId: context.team.teamId,
         status: 'failed',
         duration: Date.now() - startTime,
         errorMessage: error.message,
       })
       throw error
     }
   })
   ```

8. **API Procedures**
   ```typescript
   // src/modules/api-gateway/api-gateway.router.ts
   const apiProcedure = os
     .$context<{ team: TeamSelectAll }>()
     .use(apiKeyAuthMiddleware)
     .use(corsValidationMiddleware)
     .use(ipWhitelistMiddleware)
     .use(teamRateLimitMiddleware)
     .use(subscriptionCheckMiddleware)
     .use(requestLoggerMiddleware)

   export const createJournalEntry = apiProcedure
     .route({ method: 'POST', path: '/v1/journal_entry/create' })
     .input(journalEntryCreateInputZod)
     .output(journalEntrySelectAllZod)
     .meta({
       openapi: {
         description: "Save a journal entry",
         tags: ["Product API"],
         security: [{ apiKey: [], teamId: [] }],
       }
     })
     .handler(saveJournalEntryHandler)
   ```

9. **OpenAPI Spec Generation**
   ```typescript
   // src/modules/api-gateway/openapi.spec.ts
   import { OpenAPIGenerator } from '@orpc/openapi'

   const generator = new OpenAPIGenerator({
     schemaConverters: [new ZodToJsonSchemaConverter()],
   })

   export const generateOpenAPISpec = async () => {
     return await generator.generate(apiGatewayRouter, {
       info: {
         title: 'Product API',
         version: '1.0.0',
         description: 'External API for partners',
       },
       servers: [{ url: env.VITE_API_URL }],
       security: {
         apiKey: {
           type: 'apiKey',
           name: 'x-api-key',
           in: 'header',
         },
         teamId: {
           type: 'apiKey',
           name: 'x-team-id',
           in: 'header',
         },
       },
     })
   }
   ```

10. **Serve OpenAPI Docs**
    - [ ] Serve spec at `/api/documentation/json`
    - [ ] Consider Swagger UI (may need separate Fastify instance or custom HTML)

**Testing:**
- [ ] Test API key authentication
- [ ] Test CORS validation with various origins
- [ ] Test IP whitelist
- [ ] Test per-team rate limiting
- [ ] Test subscription quota enforcement
- [ ] Test request logging
- [ ] Validate OpenAPI spec generation
- [ ] Test full API flow end-to-end

---

### Phase 5: Advanced Features

**Tasks:**

1. **Teams Module**
   - [ ] Convert teams CRUD procedures
   - [ ] Convert team members procedures
   - [ ] Test team-based authorization

2. **Subscriptions Module**
   - [ ] Convert subscription CRUD procedures
   - [ ] Port subscription tracking logic
   - [ ] Test quota tracking and alerts

3. **Webhook System**
   - [ ] Port `webhookQueue.utils.ts`
   - [ ] Port webhook processor
   - [ ] Create internal API endpoint for webhook processing
   - [ ] Test webhook delivery and retry logic

4. **Internal Router**
   ```typescript
   // src/modules/api-gateway/internal.router.ts
   const internalProcedure = os
     .use(async ({ context, next }) => {
       const secret = context.headers['x-internal-secret']
       if (secret !== env.INTERNAL_API_SECRET) {
         throw new ORPCError('FORBIDDEN', { message: 'Invalid secret' })
       }
       return next()
     })

   export const processWebhooks = internalProcedure
     .route({ method: 'POST', path: '/process-webhooks' })
     .handler(async () => {
       await processWebhookQueue()
       return { success: true }
     })
   ```

**Testing:**
- [ ] Test teams CRUD
- [ ] Test subscriptions and quota
- [ ] Test webhook queue and processing
- [ ] Test internal API authentication

---

### Phase 6: Observability & Production Readiness

**Tasks:**

1. **OpenTelemetry Integration**
   ```typescript
   // src/observability/otel.ts
   import { OTelPlugin } from '@orpc/otel'
   import { NodeSDK } from '@opentelemetry/sdk-node'

   const sdk = new NodeSDK({
     serviceName: 'backend',
     // ... configure exporters
   })
   sdk.start()

   // Add to handler
   const handler = new RPCHandler(router, {
     plugins: [
       new OTelPlugin({
         includeInput: true,
         includeOutput: false,
       }),
     ],
   })
   ```

2. **Logging with Pino**
   - Already configured via `LoggingHandlerPlugin`
   - [ ] Configure log levels per environment
   - [ ] Add request ID correlation
   - [ ] Test log output

3. **Health Check Endpoints**
   ```typescript
   // src/router.ts
   export const healthCheck = publicProcedure
     .handler(async () => {
       // Check DB connection
       await db.$query`SELECT 1`
       return {
         status: 'ok',
         timestamp: new Date().toISOString(),
         version: env.APP_VERSION,
       }
     })
   ```

4. **Error Tracking**
   - [ ] Integrate Sentry or similar
   - [ ] Add to error interceptors
   - [ ] Test error reporting

5. **Performance Monitoring**
   - [ ] Add custom metrics for critical paths
   - [ ] Monitor rate limiter state
   - [ ] Monitor database connection pool

6. **Docker Configuration**
   - [ ] Update `Dockerfile` (remove Fastify-specific config)
   - [ ] Test Docker build and run
   - [ ] Update `DEPLOYMENT.md`

7. **PM2 Configuration**
   - [ ] Update `ecosystem.config.cjs` if needed
   - [ ] Test PM2 deployment

**Testing:**
- [ ] Test telemetry data collection
- [ ] Test health check endpoint
- [ ] Test error tracking
- [ ] Test Docker deployment
- [ ] Load test to ensure performance

---

### Phase 7: Testing & Validation

**Tasks:**

1. **Unit Tests**
   - [ ] Test procedures in isolation
   - [ ] Test middleware chains
   - [ ] Test error handling
   - [ ] Test utilities and helpers

2. **Integration Tests**
   - [ ] Test full workflows (register → login → CRUD)
   - [ ] Test OAuth2 flow
   - [ ] Test API Gateway flow
   - [ ] Test webhook processing

3. **Frontend Client Migration**
   ```typescript
   // apps/frontend/src/utils/orpc.client.ts
   import { createORPCClient } from '@orpc/client'
   import type { BackendRouter } from '../../../backend/src/router'

   export const client = createORPCClient<BackendRouter>({
     baseURL: import.meta.env.VITE_API_URL,
     fetch: (input, init) => fetch(input, {
       ...init,
       credentials: 'include', // Include cookies
     }),
   })

   // Usage
   const sessionInfo = await client.auth.getSessionInfo()
   const entries = await client.journalEntries.getAll()
   ```

4. **TanStack Query Integration**
   ```typescript
   // apps/frontend/src/utils/orpc-query.ts
   import { createQueryHooks } from '@orpc/tanstack-query'
   import { client } from './orpc.client'

   export const orpc = createQueryHooks(client)

   // Usage in components
   const { data, isLoading } = orpc.journalEntries.getAll.useQuery()
   const createMutation = orpc.journalEntries.create.useMutation()
   ```

5. **End-to-End Tests**
   - [ ] Test full user journeys
   - [ ] Test cross-feature workflows
   - [ ] Test error scenarios

6. **Load Testing**
   - [ ] Test rate limiting under load
   - [ ] Test database performance
   - [ ] Test concurrent requests
   - [ ] Compare performance with old backend

**Testing Tools:**
- Vitest for unit tests
- Playwright for E2E tests
- k6 or Artillery for load testing

---

### Phase 8: Cutover & Deprecation

**Tasks:**

1. **Staging Deployment**
   - [ ] Deploy new backend to staging
   - [ ] Deploy frontend with new client to staging
   - [ ] Run full test suite on staging
   - [ ] Verify all features work

2. **Parallel Testing**
   - [ ] Run old and new backends side-by-side
   - [ ] Compare responses for consistency
   - [ ] Verify session compatibility
   - [ ] Check performance metrics

3. **Production Deployment**
   - [ ] Deploy new backend to production
   - [ ] Monitor error rates and performance
   - [ ] Keep old backend running as backup
   - [ ] Gradually shift traffic (if using load balancer)

4. **Issue Resolution**
   - [ ] Monitor logs for errors
   - [ ] Fix critical issues immediately
   - [ ] Document known issues and workarounds

5. **Full Cutover**
   - [ ] Switch all traffic to new backend
   - [ ] Monitor for 24-48 hours
   - [ ] Verify no critical issues

6. **Archive Old Backend**
   - [ ] Stop old backend processes
   - [ ] Archive `apps/old-backend` directory
   - [ ] Update documentation
   - [ ] Celebrate! 🎉

---

## Testing Strategy

### Unit Tests

**Framework**: Vitest

**Coverage Target**: 80%+

**Test Structure**:
```typescript
// src/modules/users/users.router.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createMockContext } from '@backend/test/utils'
import { usersRouter } from './users.router'

describe('Users Router', () => {
  describe('getAll', () => {
    it('should return all users', async () => {
      const ctx = createMockContext({ user: { userId: '123' } })
      const result = await usersRouter.getAll({ context: ctx })
      expect(result).toBeInstanceOf(Array)
    })

    it('should throw unauthorized if not logged in', async () => {
      const ctx = createMockContext()
      await expect(
        usersRouter.getAll({ context: ctx })
      ).rejects.toThrow('UNAUTHORIZED')
    })
  })
})
```

### Integration Tests

**Test Database**: Use test database with migrations

**Test Structure**:
```typescript
// src/modules/auth/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { testServer, testDb } from '@backend/test/setup'

describe('Auth Flow Integration', () => {
  beforeAll(async () => {
    await testDb.migrate.up()
  })

  afterAll(async () => {
    await testDb.migrate.down()
    await testDb.close()
  })

  it('should complete full auth flow', async () => {
    // 1. Start OAuth flow
    const authUrl = await testServer.call(router.auth.googleAuthStart)
    expect(authUrl.redirectUrl).toContain('google.com')

    // 2. Simulate OAuth callback (mock Google response)
    const session = await testServer.call(
      router.auth.googleAuthCallback,
      { code: 'mock-code' }
    )
    expect(session.sessionId).toBeDefined()

    // 3. Get session info
    const sessionInfo = await testServer.call(
      router.auth.getSessionInfo,
      {},
      { headers: { cookie: `connect.sid=${session.sessionId}` } }
    )
    expect(sessionInfo.hasSession).toBe(true)

    // 4. Logout
    await testServer.call(router.auth.logout)
  })
})
```

### E2E Tests

**Framework**: Playwright

**Test real user flows**:
```typescript
// e2e/journal-entries.spec.ts
import { test, expect } from '@playwright/test'

test('create and view journal entry', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5173/login')
  await page.click('text=Login with Google')
  // ... OAuth flow (may need to mock)

  // Create entry
  await page.goto('http://localhost:5173/journal')
  await page.fill('[name=content]', 'Test entry')
  await page.click('button[type=submit]')

  // Verify entry appears
  await expect(page.locator('text=Test entry')).toBeVisible()
})
```

### Load Testing

**Tool**: k6

**Test scenarios**:
```javascript
// load-tests/api-load.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
}

export default function () {
  const res = http.post(
    'http://localhost:3000/rpc/journalEntries.getAll',
    JSON.stringify({}),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=...',
      },
    }
  )

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

---

## Rollback Strategy

### Preparation

1. **Keep old backend running** - Don't delete or stop until migration is stable
2. **Database backward compatibility** - Ensure schema changes don't break old backend
3. **Session compatibility** - Both backends should use same session format
4. **Feature flags** - Use flags to toggle between old and new APIs

### Rollback Scenarios

**Scenario 1: Critical Bug in New Backend**
- Switch traffic back to old backend (DNS/load balancer)
- Fix bug in new backend
- Re-deploy and re-test

**Scenario 2: Performance Issues**
- Scale new backend horizontally
- Optimize slow queries
- Consider caching strategy
- Rollback if unfixable

**Scenario 3: Data Inconsistency**
- Investigate root cause
- Fix data corruption
- May need to rollback database migration
- Re-deploy with fix

### Rollback Procedure

1. **Stop new backend**: `pm2 stop backend`
2. **Start old backend**: `pm2 start old-backend`
3. **Update frontend**: Deploy old tRPC client
4. **Monitor**: Check error rates and performance
5. **Investigate**: Debug issue in development
6. **Fix**: Deploy hotfix to new backend
7. **Re-cutover**: Switch back to new backend when ready

---

## Post-Migration Tasks

### Documentation

- [ ] Update `CLAUDE.md` with oRPC patterns
- [ ] Update `DEPLOYMENT.md` with new deployment steps
- [ ] Document new API patterns for team
- [ ] Update OpenAPI documentation
- [ ] Create migration guide for future developers

### Cleanup

- [ ] Remove old tRPC dependencies
- [ ] Remove Fastify (if not needed for OAuth2)
- [ ] Archive `apps/old-backend`
- [ ] Clean up unused middleware/utilities
- [ ] Update CI/CD pipelines

### Optimization

- [ ] Review and optimize rate limiting strategy
- [ ] Optimize database queries (add indexes if needed)
- [ ] Review error logging and alerting
- [ ] Optimize bundle size (frontend client)
- [ ] Setup CDN for static assets if needed

### Monitoring

- [ ] Setup dashboards for key metrics
- [ ] Configure alerts for error rates
- [ ] Monitor rate limiter effectiveness
- [ ] Track API usage and quotas
- [ ] Monitor session store performance

### Future Enhancements

- [ ] Consider using Redis for session store (multi-server scaling)
- [ ] Consider using Redis for rate limiting (multi-server)
- [ ] Implement WebSocket support for real-time features
- [ ] Add streaming support for large responses
- [ ] Consider contract-first development for new features
- [ ] Explore oRPC NestJS integration if needed

---

## Appendix

### Key Differences: tRPC vs oRPC

| Feature | tRPC | oRPC |
|---------|------|------|
| **Router** | `t.router({ ... })` | Plain object `{ ... }` |
| **Procedure** | `.query()` / `.mutation()` | `.handler()` |
| **Context** | Created in `createContext` | Injected in handler, typed with `.$context<T>()` |
| **Middleware** | `t.middleware()` | `.use()` on procedure |
| **Error** | `TRPCError` | `ORPCError` |
| **OpenAPI** | External plugin | Built-in with `.route()` |
| **Adapter** | Fastify plugin | RPCHandler / OpenAPIHandler |
| **Client** | `createTRPCReact` | `createORPCClient` + `createQueryHooks` |
| **Streaming** | Limited | Native SSE, WebSocket |
| **Contract-First** | No | Yes (optional) |

### Useful Resources

- **oRPC Docs**: https://orpc.dev/docs
- **oRPC GitHub**: https://github.com/unnoq/orpc
- **Orchid ORM Docs**: https://orchid-orm.netlify.app/
- **OpenTelemetry Docs**: https://opentelemetry.io/docs/

### Team Contacts

- **Migration Lead**: [Name]
- **Backend Team**: [Names]
- **Frontend Team**: [Names]
- **DevOps**: [Names]

---

**Last Updated**: 2025-12-13
**Document Owner**: Migration Team
**Status**: In Progress - Phases 0, 1, 2, 3 Complete, Ready for Phase 4

---

## Migration Progress Summary (Updated 2025-12-13)

### ✅ Completed Phases

**Phase 0: Foundation & Setup**
- All oRPC packages installed and configured
- Database tables and migrations copied from old-backend
- All 8 database tables registered in Orchid ORM
- Server running with plugins (CORS, CSRF, logging, error handling)

**Phase 1: Core Infrastructure**  
- Context system fully defined (`AppContext`, `AuthenticatedContext`)
- Base procedures created (`publicProcedure`, `protectedProcedure`, `sensitiveProcedure`)
- Session loading middleware integrated into publicProcedure
- Error parser ported from tRPC to oRPC (`orpcErrorParser`)
- Security plugins configured (CORS, CSRF protection, strict GET method)
- Rate limiting configured (but disabled pending bug fix)

**Phase 2: Authentication & Session Management**
- Better-auth integration complete (replaces manual session management)
- Server routes `/api/auth/*` to better-auth handler via `toNodeHandler`
- Auth middleware validates sessions and injects user context
- Device fingerprinting implemented (browser, OS, device detection)
- Header conversion utilities for Node.js ↔ Web Headers compatibility
- Auth router with `getSessionInfo` and `logout` procedures
- OAuth router with Google OAuth placeholder endpoints

**Phase 3: Core Modules**
- **Users Module** (`apps/backend/src/modules/users/users.router.ts`)
  - `getAll` - Get all users (protected)
  - `getById` - Get user by ID (protected)
  - `create` - Create/register user (public with validation)

- **Journal Entries Module** (`apps/backend/src/modules/journal-entries/journal-entries.router.ts`)
  - `getAll` - Get all entries for authenticated user
  - `getById` - Get entry by ID (with ownership check)
  - `create` - Create new journal entry
  - `getByUser` - Get entries by user ID
  - `delete` - Delete entry (with ownership check)

- **Prompts Module** (`apps/backend/src/modules/prompts/prompts.router.ts`)
  - `getAllActive` - Get all active prompts
  - `getRandomActive` - Get random active prompt
  - `getById` - Get prompt by ID
  - `getByCategory` - Filter prompts by active/inactive status

- **Router Integration** - All modules added to main router in `apps/backend/src/router.ts`

### 🚧 Next Phase: Phase 4 - API Gateway & OpenAPI

**Recommended Next Steps:**
1. Setup dual handlers (RPCHandler + OpenAPIHandler) in server
2. Create API key authentication middleware
3. Implement team-based CORS validation
4. Add IP whitelist middleware
5. Implement per-team rate limiting
6. Create request logging middleware
7. Add subscription checking middleware
8. Generate OpenAPI spec for external REST API

**Key Files Created:**
- `apps/backend/src/modules/auth/auth.router.ts`
- `apps/backend/src/modules/auth/auth.middleware.ts`
- `apps/backend/src/modules/auth/oauth/oauth.router.ts`
- `apps/backend/src/modules/users/users.router.ts`
- `apps/backend/src/modules/journal-entries/journal-entries.router.ts`
- `apps/backend/src/modules/prompts/prompts.router.ts`

**Known Issues:**
- Rate limiting middleware throws errors when enabled (needs investigation)
- Pre-existing TypeScript type inference warnings in router (non-blocking)
