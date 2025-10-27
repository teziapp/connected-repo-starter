# Full-Stack TypeScript Monorepo

A production-ready Turborepo monorepo for building full-stack TypeScript applications with end-to-end type safety.

## Tech Stack

### Backend
- **Runtime**: Node.js 22+
- **Framework**: [Fastify](https://fastify.dev/) - Fast and low overhead web framework
- **API Layer**: [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- **Database**: PostgreSQL with [Orchid ORM](https://orchid-orm.netlify.app/)
- **Observability**: OpenTelemetry integration
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: React Router
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) + tRPC Client
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
│   ├── backend/          # Fastify + tRPC API server
│   │   ├── src/
│   │   │   ├── db/      # Database tables and ORM config
│   │   │   ├── configs/ # App configuration
│   │   │   ├── middlewares/
│   │   │   ├── utils/
│   │   │   ├── server.ts       # Entry point
│   │   │   ├── app.ts          # Fastify setup
│   │   │   ├── trpc.ts         # tRPC initialization
│   │   │   └── router.trpc.ts  # API routes
│   │   └── package.json
│   └── frontend/        # React + Vite frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── modules/
│       │   ├── App.tsx
│       │   └── router.tsx
│       └── package.json
├── packages/
│   ├── typescript-config/  # Shared TypeScript configs
│   └── zod-schemas/        # Shared Zod schemas and enums for validation and type safety
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
git clone git@github.com:teziapp/connected-repo-starter.git
cd connected-repo-starter
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
# Copy environment examples
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

4. Configure your database connection in `apps/backend/.env`

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

### End-to-End Type Safety & Shared Schemas

The monorepo achieves full type safety without code generation and uses a shared package for Zod schemas:

1. Backend exports router type from `router.trpc.ts`
2. Frontend imports this type directly via TypeScript workspace references
3. Shared Zod schemas and enums are defined in `packages/zod-schemas/` and imported by both backend and frontend for consistent validation and type inference
4. All API calls have autocomplete and compile-time type checking

```typescript
// Example: Importing shared Zod schema
import { userSchema } from "@connected-repo/zod-schemas";

// Frontend automatically knows about all backend procedures
const { data } = trpc.user.getAll.useQuery();
const createUser = trpc.user.create.useMutation();
```

### Database Layer & Shared Validation

- **ORM**: Orchid ORM with automatic snake_case conversion
- **Type Safety**: Zod schemas for input validation
- **Pattern**: Table definitions with validation schemas imported from `packages/zod-schemas/` for shared use

Example table structure:
```typescript
export class UserTable extends BaseTable {
  readonly table = "user";
  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    name: t.string(),
    // ...
  }));
}

// Use shared schema for validation
import { createUserSchema } from "@connected-repo/zod-schemas";
```

### Error Handling

Multi-layer error handling system:
- **tRPC Layer**: Transforms errors into structured responses
- **Error Parser**: Converts database/validation errors to user-friendly messages
- **Fastify Handler**: Catches unhandled errors

### Security

- Rate limiting (production/staging only)
- CORS with configurable origins
- Helmet security headers
- Environment-based configuration

### Observability

- OpenTelemetry integration for tracing
- Custom spans for tRPC errors

## Adding New Features

### New Database Table

1. Create table class in `apps/backend/src/db/tables/`
2. Add Zod validation schemas
3. Register in `apps/backend/src/db/db.ts`
4. `yarn run db g <migration_name>` (A new migration file will be created in  `apps/backend/src/db/migrations/`)
5. `yarn run db up` (Run migrations)

### New API Endpoint

1. Add procedure to `router.trpc.ts` with Zod input schema
2. Use `protectedProcedure` for database operations which require auth
3. Frontend automatically gets updated types

### New Frontend Page

1. Create component in `apps/frontend/src/pages/`
2. Add route in `apps/frontend/src/router.tsx`
3. Use tRPC hooks for data fetching

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

- See [CLAUDE.md](./CLAUDE.md) for detailed architecture and development guidance

## License

[AGPL-3.0] (./LICENSE) 
Copyright (c) 2025 Tezi Communications LLP, India
