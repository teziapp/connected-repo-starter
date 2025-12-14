# Full-Stack TypeScript Monorepo

A production-ready Turborepo monorepo for building full-stack TypeScript applications with end-to-end type safety.

## Tech Stack

### Backend
- **Runtime**: Node.js 22+
- **Framework**: [Fastify](https://fastify.dev/) - Fast and low overhead web framework
- **API Layer**:
  - [oRPC](https://orpc.dev/) - End-to-end typesafe APIs for internal/frontend communication
  - REST/OpenAPI - External product APIs with automatic Swagger documentation
- **Database**: PostgreSQL with [Orchid ORM](https://orchid-orm.netlify.app/)
- **API Gateway**: API key authentication, rate limiting, CORS validation, IP whitelisting, subscription management
- **Observability**: OpenTelemetry integration
- **Security**: Helmet, CORS, Rate Limiting, Better Auth (Google OAuth)
- **Deployment**: Docker support with automated migrations

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: React Router
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) + oRPC Client
- **Type Safety**: Direct TypeScript imports from backend

### Tooling
- **Package Manager**: Yarn (v1.22.22)
- **Monorepo**: [Turborepo](https://turbo.build/repo)
- **Linting**: Biome
- **Formatting**: Biome
- **TypeScript**: v5.8.x with strict mode

## Project Structure

```
.
├── apps/
│   ├── backend/                      # Fastify server
│   │   ├── src/
│   │   │   ├── modules/              # Feature modules
│   │   │   │   ├── api-gateway/      # External REST API with OpenAPI
│   │   │   │   ├── auth/             # OAuth2 + session management
│   │   │   │   ├── journal-entries/  # Journal entry feature (tRPC)
│   │   │   │   ├── users/            # User management (tRPC)
│   │   │   │   ├── teams/            # Teams & members
│   │   │   │   ├── subscriptions/    # API subscriptions
│   │   │   │   └── logs/             # API request logs
│   │   │   ├── routers/              # Route aggregation
│   │   │   │   ├── app.router.ts     # Main router
│   │   │   │   ├── openapi.plugin.ts # OpenAPI/Swagger setup
│   │   │   │   └── trpc.router.ts    # tRPC routes
│   │   │   ├── db/                   # Database layer
│   │   │   ├── configs/              # App configuration
│   │   │   ├── middlewares/          # Global middleware
│   │   │   ├── server.ts             # Entry point
│   │   │   ├── app.ts                # Fastify setup
│   │   │   └── trpc.ts               # tRPC initialization
│   │   ├── Dockerfile                # Docker configuration
│   │   ├── DEPLOYMENT.md             # Deployment guide
│   │   └── package.json
│   └── frontend/                     # React + Vite
│       ├── src/
│       │   ├── components/           # Reusable components
│       │   ├── pages/                # Page components
│       │   ├── modules/              # Feature modules
│       │   ├── App.tsx
│       │   └── router.tsx
│       └── package.json
├── packages/
│   ├── typescript-config/            # Shared TypeScript configs
│   ├── ui-mui/                       # Material-UI component library
│   └── zod-schemas/                  # Shared Zod schemas for validation
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 22+
- Yarn 1.22.22
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone git@github.com:teziapp/connected-repo-starter-oRPC.git
cd connected-repo-starter-oRPC
```

2. Set up environment variables:
```bash
# Copy environment examples
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

3. Configure your database connection in `apps/backend/.env`

4. Install dependencies & build packages:
```bash
yarn install
yarn build
```

5. Create a PostgreSQL database, run migrations & seed data:
```bash
yarn run db create;
yarn run db up;
yarn run db seed;
```

### Development

Start both frontend and backend in development mode:
```bash
yarn dev
```

Or run them individually:
```bash
# Backend only (http://localhost:3000)
cd apps/backend && yarn dev

# Frontend only (http://localhost:5173)
cd apps/frontend && yarn dev
```

## Available Scripts

### Development
- `yarn dev` - Start all apps in watch mode
- `yarn build` - Build all apps and packages
- `yarn lint` - Run Biome linter across all workspaces
- `yarn format` - Format code with Biome
- `yarn check-types` - Type check all workspaces
- `yarn clean` - Remove node_modules and build artifacts

### Production
```bash
# Build and start the backend
cd apps/backend
yarn build
yarn start
```

## Key Features

### Dual API Architecture

**oRPC for Internal APIs:**
- Type-safe APIs for frontend-backend communication
- Zero code generation - types flow automatically
- Routes: `/orpc/*`
- Example: `orpc.journalEntry.create.useMutation()`

**REST/OpenAPI for External APIs:**
- Automatic Swagger documentation at `/api/documentation`
- OpenAPI 3.1.0 spec generation from Zod schemas
- Routes: `/api/v1/*`
- Full middleware chain: API key auth, rate limiting, CORS validation, IP whitelist, subscription tracking

### API Gateway Features

**Authentication & Authorization:**
- API key-based authentication (`x-api-key` + `x-team-id` headers)
- Team-based access control with scrypt-hashed API keys
- User-specific subscriptions (teamId + userId + productSku)
- Bearer token authentication for webhooks

**Security:**
- Global rate limiting (2 req/sec, burst 5 req/10sec in production)
- Global CORS allows all origins; team-specific CORS validation via middleware
- Per-team rate limiting (configurable requests per minute)
- CORS validation against team's allowed domains with preflight handling
- IP whitelist per team
- OpenAPI security schemes (apiKey, teamId headers)
- Request logging to `api_product_request_logs` table
- 404 route protection with stricter rate limiting

**Subscription Management:**
- Quota enforcement per subscription
- Atomic real-time usage tracking
- 90% usage threshold triggers webhook alert
- Webhook queue with retry logic (3 max attempts, exponential backoff)
- Batch processing limit: 50 webhooks per run
- Configuration constants in `api-gateway/constants/apiGateway.constants.ts`

### End-to-End Type Safety & Shared Schemas

The monorepo achieves full type safety without code generation:

1. Backend exports router type from `router.ts`
2. Frontend imports this type directly via TypeScript workspace references
3. Shared Zod schemas in `packages/zod-schemas/`:
   - Entity schemas: `<entity>CreateInputZod`, `<entity>UpdateInputZod`, `<entity>SelectAllZod`
   - API product schemas with OpenAPI metadata
   - Enum definitions for request status, webhook status, etc.
4. All API calls have autocomplete and compile-time type checking

```typescript
// oRPC usage (internal)
const { data } = orpc.journalEntry.getAll.useQuery();
const create = orpc.journalEntry.create.useMutation();

// OpenAPI usage (external)
// See interactive docs at /api/documentation
```

### Database Layer & Shared Validation

- **ORM**: Orchid ORM with automatic snake_case conversion and transaction support
- **Type Safety**: Zod schemas for input validation across backend and frontend
- **Timestamps**: Epoch milliseconds (number) not Date objects
- **Naming**: Descriptive IDs (`userId`, `teamId`) and FKs (`authorUserId`)
- **Tables**: Organized by feature module in `modules/<feature>/tables/`
- **Indexes**: Composite indexes on frequently queried columns for performance

Key tables: users, sessions, teams, team_members, journal_entries, subscriptions, api_product_request_logs, webhook_call_queue

### Error Handling

Multi-layer error handling system:
- **oRPC Layer**: Transforms errors into structured responses
- **Error Parser**: Converts database/validation errors to user-friendly messages
- **Fastify Handler**: Catches unhandled errors

### Security

**Global:**
- Rate limiting: 2 req/sec, burst 5 req/10sec (production)
- CORS allows all origins globally (team validation via middleware)
- Helmet security headers
- 404 route protection (stricter rate limiting)
- Environment-based configuration

**Authentication:**
- Better Auth integration with Google OAuth
- Session management with secure cookies
- Device security and session tracking

**API Gateway:**
- API key authentication (scrypt hashed) via x-api-key + x-team-id headers
- Team-based access control
- Per-team rate limiting (configurable per minute)
- Per-team CORS validation against allowedDomains with preflight handling
- Per-team IP whitelist validation
- OpenAPI security schemes defined
- Internal routes secured by bearer token (INTERNAL_API_SECRET)
- Webhook endpoints secured by bearer token (team.subscriptionAlertWebhookBearerToken)

### Observability

- OpenTelemetry integration for tracing
- Custom spans for oRPC errors

## Adding New Features

### New Database Table

1. Create table in `apps/backend/src/modules/<feature>/tables/<entity>.table.ts`
   - Use descriptive IDs: `userId`, `teamId` (not generic `id`)
   - Use descriptive FKs: `authorUserId` (not just `authorId`)
   - Use `timestampNumber` for timestamps (epoch milliseconds)
2. Create Zod schemas in `packages/zod-schemas/src/<entity>.zod.ts`
3. Register table in `apps/backend/src/db/db.ts`
4. Run `yarn run db g <migration_name>` then `yarn run db up`

### New oRPC Endpoint (Internal API)

1. Import schema from `@connected-repo/zod-schemas/<entity>.zod`
2. Create procedure in `apps/backend/src/modules/<feature>/<feature>.orpc.ts`
3. Register in `apps/backend/src/router.ts`
4. Use `protectedProcedure` for operations requiring auth
5. Frontend auto-gets types via oRPC router type import

### New API Product Endpoint (External OpenAPI)

1. Define Zod schemas in `packages/zod-schemas/src/<entity>.zod.ts`
2. Add product to `API_PRODUCTS` array in `packages/zod-schemas/src/enums.zod.ts`
3. Create handler in `apps/backend/src/modules/api-gateway/handlers/<product>.handler.ts`
4. Add route in `apps/backend/src/modules/api-gateway/api-gateway.router.ts`:
   - Use `.withTypeProvider<FastifyZodOpenApiTypeProvider>()`
   - Apply middleware chain (apiKeyAuth, CORS, whitelist, rateLimit, subscriptionCheck)
5. Test via Swagger UI at `/api/documentation`

### New Frontend Page

1. Create component in `apps/frontend/src/pages/` or `modules/<feature>/pages/`
2. Add route in `apps/frontend/src/router.tsx` with lazy loading
3. Use oRPC hooks for data fetching

## Turborepo

This monorepo uses Turborepo for task orchestration. Key tasks:

- `build` - Builds with dependency graph awareness
- `dev` - Runs development servers (persistent, no cache)
- `check-types` - Type checking across workspaces
- `clean` - Cleanup task

Learn more:
- [Tasks](https://turbo.build/repo/docs/crafting-your-repository/running-tasks)
- [Caching](https://turbo.build/repo/docs/crafting-your-repository/caching)
- [Configuration](https://turbo.build/repo/docs/reference/configuration)

## Documentation

- [AGENTS.md](./AGENTS.md) - Agent guidelines for coding agents
- [apps/frontend/AGENTS.md](./apps/frontend/AGENTS.md) - Frontend React patterns and best practices
- [packages/ui-mui/AGENTS.md](./packages/ui-mui/AGENTS.md) - UI component library documentation
- [packages/zod-schemas/AGENTS.md](./packages/zod-schemas/AGENTS.md) - Zod schema documentation
- [packages/AGENTS.md](./packages/AGENTS.md) - Package architecture overview

## API Documentation

**Interactive API Documentation:**
- Swagger UI: http://localhost:3000/api/documentation
- OpenAPI Spec: http://localhost:3000/api/documentation/json

**Endpoints:**
- oRPC APIs: http://localhost:3000/orpc
- REST APIs: http://localhost:3000/api/v1/*
- Health Check: http://localhost:3000/health
- Better Auth: http://localhost:3000/api/auth/*
- Internal APIs: http://localhost:3000/internal/* (secured by bearer token)

## License

[AGPL-3.0] (./LICENSE) 
Copyright (c) 2025 Tezi Communications LLP, India
