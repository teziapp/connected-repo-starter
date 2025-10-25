# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Turborepo monorepo starter for building full-stack TypeScript applications with:
- **Backend**: Node.js + Fastify + Orchid ORM + tRPC + OpenTelemetry
- **Frontend**: React + Vite + TanStack Query + tRPC Client
- **Database**: PostgreSQL with Orchid ORM
- **Package Manager**: Yarn (v1.22.22)
- **Node Version**: 22+

## Common Commands

### Development
```bash
# Start all apps in development mode (runs both frontend and backend)
yarn dev

# Start only the backend server
cd apps/server && yarn dev

# Start only the frontend
cd apps/frontend && yarn dev
```

### Building
```bash
# Build all apps and packages
yarn build

# Build specific app
cd apps/server && yarn build
cd apps/frontend && yarn build
```

### Code Quality
```bash
# Run linters across all workspaces
yarn lint

# Format code with Prettier
yarn format

# Type check all workspaces
yarn check-types
```

### Database
The project uses Orchid ORM with PostgreSQL. Manual table creation is currently required (see SETUP.md for SQL).

### Testing
Currently, the project does not have a test suite configured. When adding tests, consider:
- Backend: Add test scripts to `apps/server/package.json`
- Frontend: Add test scripts to `apps/frontend/package.json`
- Configure Turbo to run tests across workspaces

### Production
```bash
# Build and start the backend server
cd apps/server
yarn build
yarn start  # Runs from dist/src/server.js
```

## Architecture

### Monorepo Structure

```
apps/
├── server/          # Fastify + tRPC API server
└── frontend/        # React + Vite frontend
packages/
└── typescript-config/  # Shared TypeScript configurations
```

### Backend Architecture (`apps/server`)

**Key Directories:**
- `src/db/` - Database configuration and ORM setup
  - `db.ts` - Orchid ORM instance with all registered tables
  - `baseTable.ts` - Base table configuration (snake_case enabled)
  - `tables/` - Table schemas with Zod validation schemas
  - `config.ts` - Database connection configuration
- `src/configs/` - Application configuration (env, logger)
- `src/middlewares/` - Fastify middleware (error handling)
- `src/utils/` - Utility functions (error parser)

**Core Files:**
- `server.ts` - Application entry point, registers CORS, Helmet, rate limiting
- `app.ts` - Fastify instance setup and tRPC plugin registration
- `trpc.ts` - tRPC initialization with context, error formatting, and middleware
- `router.trpc.ts` - All tRPC routes (user, post endpoints)

**Database Pattern:**
1. Define table schema in `db/tables/*.table.ts` extending `BaseTable`
2. Add Zod schemas for input validation in the same file
3. Register table in `db/db.ts` using `orchidORM()`
4. Create tRPC procedures in `router.trpc.ts` using the schemas

Example table structure:
```typescript
export class UserTable extends BaseTable {
  readonly table = "user";
  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    // ... other columns
  }));
}

export const createUserSchema = z.object({...});
export type CreateUserInput = z.infer<typeof createUserSchema>;
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
- tRPC errors are automatically traced with custom spans (see `app.ts` onError handler)
- Requires `MIDDLEWARE_API_KEY` and `MIDDLEWARE_TARGET` in environment

**Security Features:**
- Rate limiting (2 req/sec, burst 5 req/10sec in production)
- CORS with configurable origins
- Helmet for security headers
- Environment-based configuration

### Frontend Architecture (`apps/frontend`)

**Key Files:**
- `App.tsx` - tRPC client setup with React Query integration
- `router.tsx` - React Router configuration
- `components/` - Reusable components (forms, lists, error boundaries)
- `pages/` - Page components (DatabaseDemo.tsx shows tRPC integration)
- `modules/` - Feature modules (auth with login/register pages)

**tRPC Client Pattern:**
```typescript
// Type-safe client imports server router type
export const trpc = createTRPCReact<AppTrpcRouter>();

// Usage in components
const { data, isLoading, error } = trpc.user.getAll.useQuery();
const createUser = trpc.user.create.useMutation();
```

**Authentication:**
- Currently uses hardcoded `x-user-id` header (value: "123")
- AuthVerifier component for route protection
- Login/Register pages in `modules/auth/`

### Type Safety

The monorepo achieves full type safety by:
1. Backend exports `AppTrpcRouter` type from `router.trpc.ts`
2. Frontend imports this type directly: `import type { AppTrpcRouter } from "../../server/src/router.trpc"`
3. tRPC client is created with this type: `createTRPCReact<AppTrpcRouter>()`
4. All API calls have autocomplete and type checking

**Important:** When adding new tRPC procedures, the frontend automatically gets updated types without manual schema generation.

### Environment Configuration

1. Common environment variables `.env` (see `.env.example`)
2. Backend `apps/server/.env` (see `apps/server/.env.example`)
3. Frontend (`apps/frontend/.env`) (see `apps/frontend/.env.example`)

### Development Workflow

1. **Database Setup**: Create PostgreSQL database and run SQL from SETUP.md
2. **Environment**: Copy `.env.example` to `.env` and configure
3. **Install**: `yarn install` from root
4. **Development**: `yarn dev` starts both apps (backend on :3000, frontend on :5173)
5. **Type Generation**: Automatic via TypeScript cross-workspace imports

### Adding New Features

**New Database Table:**
1. Create table class in `apps/server/src/db/tables/`
2. Add Zod schemas in the same file
3. Register in `apps/server/src/db/db.ts`
4. Run SQL to create table in PostgreSQL
5. Add tRPC procedures in `router.trpc.ts`

**New tRPC Endpoint:**
1. Add procedure to `router.trpc.ts` with Zod input schema
2. Use `protectedProcedure` for database operations
3. Frontend automatically gets types - no codegen needed

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
- **Formatting**: Prettier
- **TypeScript**: Strict mode enabled, v5.8.x
- **Naming**: Database uses snake_case (via Orchid ORM `snakeCase: true`)

## Known Issues

- FIXME in `apps/server/src/trpc.ts:30` - Error logging in tRPC errorFormatter not capturing full error context
- Manual database migrations required (no migration system configured)
- OpenTelemetry config in `opentelemetry.ts` has placeholder credentials

## Production Considerations

- Backend builds to `dist/` using SWC for fast transpilation
- Environment-specific rate limiting (only enabled in production/staging)
- Error stack traces only shown in development
- Frontend builds static assets with Vite
