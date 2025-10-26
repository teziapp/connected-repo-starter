# Packages - CLAUDE.md

This file provides high-level guidance for working with shared packages in this monorepo.

## Architecture Principles

All packages follow strict architectural guidelines for **optimal build performance**:

### 🚫 No Barrel Exports
- **NEVER** create `index.ts` files that re-export everything
- Each file exports independently
- Import directly from specific files: `import { Button } from '@connected-repo/ui-mui/form/Button'`
- Enables proper tree-shaking by bundlers

### 🌲 Tree-Shaking Optimized
- All packages: `"sideEffects": false` in package.json
- Only imported code gets bundled
- Significantly smaller production bundles

### 📦 Direct File Exports
- Package exports configured via package.json `exports` field
- Pattern enforced by configuration, not documentation

## Available Packages

### 1. @connected-repo/typescript-config
Shared TypeScript configurations (base, nextjs, react-library).

**Usage**:
```json
{
  "extends": "@connected-repo/typescript-config/base.json"
}
```

### 2. @connected-repo/zod-schemas
Shared Zod validation schemas for backend and frontend consistency.

**Import Pattern**:
```typescript
import { zVarchar, zPrice, zGSTIN } from '@connected-repo/zod-schemas/zod_utils'
import { NodeEnv } from '@connected-repo/zod-schemas/node_env'
```

📖 **See [zod-schemas/CLAUDE.md](./zod-schemas/CLAUDE.md) for detailed validator documentation**

### 3. @connected-repo/ui-mui
Material-UI component library with direct exports.

**Import Pattern**:
```typescript
import { Button } from '@connected-repo/ui-mui/form/Button'
import { Card } from '@connected-repo/ui-mui/layout/Card'
import { Alert } from '@connected-repo/ui-mui/feedback/Alert'
```

📖 **See [ui-mui/CLAUDE.md](./ui-mui/CLAUDE.md) for component catalog and usage**

## Quick Reference

### Import Rules
```typescript
// ✅ Correct - Direct imports
import { Button } from '@connected-repo/ui-mui/form/Button'
import { zPrice } from '@connected-repo/zod-schemas/zod_utils'

// ❌ Wrong - Package root imports
import { Button } from '@connected-repo/ui-mui'
import * as schemas from '@connected-repo/zod-schemas'
```

### Build Commands
```bash
# Build all packages
yarn build

# Build specific package
cd packages/ui-mui && yarn build

# Development watch mode
cd packages/ui-mui && yarn dev
```

## Adding a New Package

1. Create directory: `packages/my-package/`
2. Add package.json with `"sideEffects": false`
3. Configure `exports` field (no index.ts)
4. Create tsconfig.json extending base
5. Add to root workspaces

**Template package.json**:
```json
{
  "name": "@connected-repo/my-package",
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./*": {
      "types": "./src/*.ts",
      "import": "./dist/*.js"
    }
  }
}
```

## Bundle Size Impact

```typescript
// With barrel exports: ~500KB (bundles everything)
import { Button } from '@repo/ui'

// Direct imports: ~5KB (bundles only Button)
import { Button } from '@repo/ui/form/Button'
```

## Troubleshooting

**"Cannot find module" error**:
1. Run `yarn build` in the package
2. Verify exports in package.json
3. Restart TypeScript server

**Tree-shaking not working**:
1. Check `"sideEffects": false`
2. Use direct imports, not barrel exports
3. Verify `"type": "module"`

---

📖 For detailed package documentation, see individual package CLAUDE.md files.
