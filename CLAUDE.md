# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Turborepo monorepo starter for building full-stack TypeScript applications with:
- **Backend**: Node.js + Fastify + Orchid ORM + tRPC + OpenTelemetry + OAuth2
- **Frontend**: React 19 + Vite + TanStack Query + tRPC Client
- **Database**: PostgreSQL with Orchid ORM
- **Auth**: Database-backed sessions with security tracking
- **Package Manager**: Yarn (v1.22.22)
- **Node Version**: 22+

## Common Commands

### Development
```bash
# Start all apps in development mode (runs both frontend and backend)
yarn dev

# Start only the backend server
cd apps/backend && yarn dev

# Start only the frontend
cd apps/frontend && yarn dev
```

### Building
```bash
# Build all apps and packages
yarn build

# Build specific app
cd apps/backend && yarn build
cd apps/frontend && yarn build
```

### Code Quality
```bash
# Run linters across all workspaces
yarn lint

# Format code with Biome
yarn format

# Type check all workspaces
yarn check-types
```

### Database
The project uses Orchid ORM with PostgreSQL.

### Testing
Currently, the project does not have a test suite configured. When adding tests, consider:
- Backend: Add test scripts to `apps/backend/package.json`
- Frontend: Add test scripts to `apps/frontend/package.json`
- Configure Turbo to run tests across workspaces

### Production
```bash
# Build and start the backend server
cd apps/backend
yarn build
yarn start  # Runs from dist/src/backend.js
```

## Architecture

### Monorepo Structure

```
apps/
├── backend/          # Fastify + tRPC API server
└── frontend/        # React + Vite frontend
packages/
├── typescript-config/  # Shared TypeScript configurations
├── ui-mui/            # Shared Material-UI component library
└── zod-schemas/        # Shared Zod schemas and enums for validation and type safety
```

### Packages Architecture (@packages/)

All packages follow strict architectural principles for optimal build performance:

**Core Principles:**
1. **No Barrel Exports**: Each package exports components/utilities directly, avoiding index files that re-export everything
2. **Tree-Shaking Optimized**: All code is structured for maximum tree-shaking and code splitting efficiency
3. **Direct Imports**: Consumers import specific files rather than package-level exports

**Available Packages:**

- **`@connected-repo/typescript-config`**: Shared TypeScript configurations
  - `base.json` - Core TypeScript settings with strict mode
  - `library.json` - For shared library packages (extends base)
  - `react-library.json` - For React component libraries (extends library)
  - `vite.json` - For Vite-based applications (extends base)
- **`@connected-repo/zod-schemas`**: Shared Zod validation schemas following structured pattern:
  - Entity schemas: `<entity>CreateInputZod`, `<entity>UpdateInputZod`, `<entity>SelectAllZod`
  - Query schemas: `<entity>GetByIdZod`, `<entity>GetByXZod`
  - Utility validators: `zString`, `zPrice`, `zGSTIN`, `zTimestamps` (from `zod_utils`)
- **`@connected-repo/ui-mui`**: Material-UI component library with direct exports
  - Import pattern: `import { Button } from '@connected-repo/ui-mui/form/Button'`
  - NO barrel exports - each component imported directly from file path
  - Ensures optimal bundle splitting and tree-shaking

**Import Guidelines:**
```typescript
// ✅ Correct - Direct imports from specific files
import { Button } from '@connected-repo/ui-mui/form/Button'
import { TextField } from '@connected-repo/ui-mui/form/TextField'
import { userCreateInputZod } from '@connected-repo/zod-schemas/user.zod'
import { zString, zPrice } from '@connected-repo/zod-schemas/zod_utils'

// ❌ Wrong - Package-level imports (won't work)
import { Button, TextField } from '@connected-repo/ui-mui'
import * as schemas from '@connected-repo/zod-schemas'
```

**Adding New Packages:**
1. Create package directory in `packages/`
2. Configure `package.json` with proper exports (avoid index files)
3. Use direct file exports for optimal tree-shaking
4. Add to root `package.json` workspaces
5. Update TypeScript references if needed

### Backend Architecture (`apps/backend`)

**Key Directories:**
- `src/db/` - Database configuration and ORM setup
  - `db.ts` - Orchid ORM instance with all registered tables
  - `baseTable.ts` - Base table configuration (snake_case enabled)
  - `tables/` - Table class definitions (Zod schemas in @connected-repo/zod-schemas)
  - `config.ts` - Database connection configuration
- `src/configs/` - Application configuration (env, logger)
- `src/middlewares/` - Fastify middleware (error handling)
- `src/modules/auth/` - Authentication and session management
  - `session.store.ts` - Database-backed session store
  - `session.utils.ts` - Session utilities (set, clear, invalidate)
  - `tables/session.table.ts` - Session table schema
  - `oauth2/` - OAuth2 providers and handlers
- `src/utils/` - Utility functions (error parser, request metadata)

**Core Files:**
- `server.ts` - Application entry point, registers CORS, Helmet, rate limiting
- `app.ts` - Fastify instance setup and tRPC plugin registration
- `trpc.ts` - tRPC initialization with context, error formatting, and middleware
- `router.trpc.ts` - All tRPC routes (user, post endpoints)

**Database & Schema Pattern:**
1. Define table class in `modules/<feature>/tables/*.table.ts` extending `BaseTable`
2. Create Zod schemas in `packages/zod-schemas/src/*.zod.ts` following pattern:
   - `<entity>MandatoryZod` - Required fields for creation
   - `<entity>OptionalZod` - Optional/nullable fields
   - `<entity>AutoGeneratedZod` - DB-generated fields (IDs, timestamps)
   - `<entity>CreateInputZod` - For create operations
   - `<entity>UpdateInputZod` - For update operations (all partial)
   - `<entity>SelectAllZod` - Complete entity shape
   - Query schemas (getById, getByX, etc)
3. Register table in `db/db.ts` using `orchidORM()`
4. Import schemas from `@connected-repo/zod-schemas` in `router.trpc.ts`

Example table (apps/backend/src/db/tables/user.table.ts):
```typescript
export class UserTable extends BaseTable {
  readonly table = "user";
  columns = this.setColumns((t) => ({
    userId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.string().unique(),
    name: t.string().nullable(),
    ...t.timestamps(),
  }));
}
```

Example schemas (packages/zod-schemas/src/user.zod.ts):
```typescript
export const userMandatoryZod = z.object({
  email: z.email(),
});

export const userOptionalZod = z.object({
  name: zString.nullable(),
});

const userAutoGeneratedZod = z.object({
  userId: z.uuid(),
});

export const userCreateInputZod = userMandatoryZod.extend(userOptionalZod.partial().shape);
export const userUpdateInputZod = userMandatoryZod.extend(userOptionalZod.shape).extend(zTimestamps).partial();
export const userSelectAllZod = userMandatoryZod.extend(userOptionalZod.shape).extend(zTimestamps).extend(userAutoGeneratedZod.shape);
```

**tRPC Pattern:**
- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for endpoints with database error handling
- All procedures are registered in nested routers (e.g., `user.getAll`, `post.create`)

**Error Handling:**
The application has centralized error handling across three layers:

1. **tRPC Error Formatter** (`trpc.ts`): Transforms all errors into structured responses
2. **Error Parser** (`utils/errorParser.ts`): Converts database and validation errors to user-friendly messages
3. **Fastify Error Handler** (`middlewares/errorHandler.ts`): Catches all unhandled errors

Error types handled:
- Zod validation errors → 400 with field-level details
- Database constraint violations (unique, foreign key) → 409 or 400
- Not found errors → 404
- Standard tRPC errors → Appropriate HTTP status codes

**OpenTelemetry Integration:**
- Initialized in `opentelemetry.ts` (imported by `server.ts`)
- tRPC errors automatically traced with custom spans (see `app.ts` onError handler)

**Security Features:**
- Global rate limiting: 2 req/sec, burst 5 req/10sec (production)
- Global CORS allows all origins (team-specific validation via middleware)
- Helmet for security headers
- Environment-based configuration
- API Gateway: per-team CORS, IP whitelist, rate limiting, API key auth
- OpenAPI security schemes defined for external APIs

**Session Management:**
Database-backed session storage with security tracking:
- Custom `DatabaseSessionStore` implementing @fastify/session store interface
- Session table tracks: user info, IP, user agent, browser, OS, device, fingerprint
- Auto-captures request metadata on session creation
- Soft-delete pattern using `markedInvalidAt` for session invalidation
- Session expiry: 7 days (configurable via `cookieMaxAge` in app.ts)
- Device fingerprinting via SHA-256 hash of normalized headers/UA
- Utilities: `setSession()`, `clearSession()`, `invalidateAllUserSessions()`

Session workflow:
1. OAuth callback sets session via `setSession()` with user info
2. Store auto-captures IP, user agent, device metadata from request
3. Session persisted to database via DatabaseSessionStore
4. Session query filters: not expired, not marked invalid
5. Session touch updates expiry on each request

**Request Metadata Utils:**
- `getClientIpAddress()` - Extracts IP with proxy support (X-Forwarded-For, X-Real-IP)
- `parseUserAgent()` - Parses UA using ua-parser-js (browser, OS, device)
- `generateDeviceFingerprint()` - SHA-256 hash of normalized UA + headers

**Utility Functions:**
- `omitKeys()` - Remove specified keys from object (used to mask sensitive fields)

### Frontend Architecture (`apps/frontend`)

**Key Files:**
- `App.tsx` - tRPC client setup with React Query integration
- `router.tsx` - React Router configuration
- `components/` - Reusable components (forms, lists, error boundaries)
- `pages/` - Page components (DatabaseDemo.tsx shows tRPC integration)
- `modules/` - Feature modules (auth with login/register pages)

**tRPC Client Pattern:**
```typescript
// Type-safe client imports backend router type
export const trpc = createTRPCReact<AppTrpcRouter>();

// Usage in components
const { data, isLoading, error } = trpc.user.getAll.useQuery();
const createUser = trpc.user.create.useMutation();
```

**Authentication:**
- OAuth2 with Google (cookie-based sessions)
- Database-backed session storage with security tracking
- AuthVerifier component for route protection
- Login/Register pages in `modules/auth/`

### Type Safety & Shared Zod Schemas

The monorepo achieves full type safety and validation consistency by:
1. Backend exports `AppTrpcRouter` type from `router.trpc.ts`
2. Frontend imports this type directly: `import type { AppTrpcRouter } from "../../backend/src/router.trpc"`
3. Shared Zod schemas and enums are defined in `packages/zod-schemas/` and imported by both backend and frontend for consistent validation and type inference
4. All API calls have autocomplete and type checking
5. VERY IMPORTANT - Don't use `any` or `as unknown` for type safety

**Important:** When adding new tRPC procedures, the frontend automatically gets updated types without manual schema generation.

### Environment Configuration

1. Common environment variables `.env` (see `.env.example`)
2. Backend `apps/backend/.env` (see `apps/backend/.env.example`)
3. Frontend (`apps/frontend/.env`) (see `apps/frontend/.env.example`)

### Development Workflow

1. **Database Setup**: Create PostgreSQL database and run Orchid-ORM migrations
2. **Environment**: Copy `.env.example` to `.env` and configure
3. **Install**: `yarn install` from root
4. **Development**: `yarn dev` starts both apps (backend on :3000, frontend on :5173)
5. **Type Generation**: Automatic via TypeScript cross-workspace imports

### Adding New Features

**New Database Table:**
1. Create table class in `apps/backend/src/db/tables/<entity>.table.ts` extending BaseTable
   - Use descriptive ID names: `userId`, `postId`, `productId` (not just `id`)
   - Use descriptive FK names: `authorUserId`, `categoryId` (not just `authorId`)
2. Create Zod schemas in `packages/zod-schemas/src/<entity>.zod.ts`:
   - Define `<entity>MandatoryZod` (required fields)
   - Define `<entity>OptionalZod` (optional/nullable fields)
   - Define `<entity>AutoGeneratedZod` (DB-generated: IDs, timestamps)
   - Export `<entity>CreateInputZod`, `<entity>UpdateInputZod`, `<entity>SelectAllZod`
   - Export query schemas: `<entity>GetByIdZod`, etc
3. Register table in `apps/backend/src/db/db.ts`
4. Run migration: `yarn run db g <migration_name>` then `yarn run db up`
5. Import schemas in `router.trpc.ts` and create tRPC procedures

**New tRPC Endpoint:**
1. Import schema from `@connected-repo/zod-schemas/<entity>.zod`
2. Add procedure to `router.trpc.ts`: `.input(<schema>Zod)`
3. Use `protectedProcedure` for operations requiring auth/DB error handling
4. Frontend auto-gets types via tRPC router type import

**New Frontend Page:**
1. Create component in `apps/frontend/src/pages/`
2. Add route in `apps/frontend/src/router.tsx`
3. Use tRPC hooks for data fetching

## Build System (Turbo)

Turbo tasks configured in `turbo.json`:
- `build`: Builds apps with dependency graph awareness
- `dev`: Runs development servers (cache disabled, persistent)
- `check-types`: Type checking across workspaces
- `clean`: Removes node_modules and build artifacts

Tasks run with `turbo run <task>` or via yarn scripts.

## Code Style

- **Linting**: Biome (configured in `biome.json`)
- **Formatting**: Biome
- **TypeScript**: Strict mode enabled, v5.8.x
- **Naming**: Database uses snake_case (via Orchid ORM `snakeCase: true`)

## Known Issues

- FIXME in `apps/backend/src/trpc.ts:30` - Error logging in tRPC errorFormatter not capturing full error context
- Manual database migrations required (no migration system configured)
- OpenTelemetry config in `opentelemetry.ts` has placeholder credentials

## Production Considerations

- Backend builds to `dist/` using SWC for fast transpilation
- Environment-specific rate limiting (only enabled in production/staging)
- Error stack traces only shown in development
- Frontend builds static assets with Vite
