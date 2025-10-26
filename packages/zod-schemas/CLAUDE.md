# @connected-repo/zod-schemas

Shared Zod validation schemas and utility functions for consistent validation across backend and frontend.

## Purpose

This package provides:
- Database-aligned validators matching Orchid ORM types
- Business-specific validators (price, quantity, amount)
- Indian compliance document validators (GSTIN, PAN, Udyog Aadhaar)
- Contact and location validators
- Reusable schema builders for common patterns

## Package Structure

```
zod-schemas/
├── src/
│   ├── node_env.ts     # Environment enum (development, production, staging)
│   └── zod_utils.ts    # Reusable Zod schema builders
├── dist/               # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Import Pattern

```typescript
// ✅ Correct - Direct file imports
import { zVarchar, zPrice, zGSTIN } from '@connected-repo/zod-schemas/zod_utils'
import { NodeEnv } from '@connected-repo/zod-schemas/node_env'

// ❌ Wrong - Package root imports won't work
import { zVarchar } from '@connected-repo/zod-schemas'
```

## Available Validators

### String Types

```typescript
// Basic string (trimmed)
zString

// Variable-length string
zVarchar(minLength?: number, maxLength?: number)
// Default: min=0, max=255
// Example: zVarchar(3, 50) // Username: 3-50 chars

// Long text
zText(minLength?: number)
// Default: min=0, no max
// Example: zText(10) // Description with min 10 chars
```

### Numeric Types

```typescript
// Small integer
zSmallint(min?: number, max?: number)
// Default: -32,768 to 32,767
// Example: zSmallint(0, 100) // Percentage

// Standard integer
zInteger(min?: number, max?: number)
// Default: -2,147,483,648 to 2,147,483,647
// Example: zInteger(1) // Positive integer

// Custom decimal
zDecimal(precision: number, scale: number, min?: number, max?: number)
// Returns string representation
// Example: zDecimal(10, 2, 0) // Max 10 digits, 2 decimal places, non-negative
```

### Business Types

```typescript
// Price: Decimal(10,2) with min 0.01
zPrice
// Example: Product price in currency units

// Quantity: Decimal(11,3) with min 0.001
zQuantity
// Example: Item quantity (supports 3 decimal places)

// Amount: Decimal(15,2) with custom range
zAmount(min?: number, max?: number)
// Default: -Infinity to +Infinity
// Example: zAmount(0) // Non-negative financial amount
```

### Compliance Documents (India)

```typescript
// GSTIN - Goods and Services Tax Identification Number
zGSTIN
// 15-character alphanumeric with checksum validation
// Format: 27AAPFU0939F1ZV
// Validates format and checksum

// PAN - Permanent Account Number
zPAN
// 10-character alphanumeric
// Format: ABCDE1234F

// Udyog Aadhaar
zUdyogAadhaar
// 12-character format: 2345 6789 0123

// Udyam Registration Number
zUdyamRegistrationNumber
// 19-character format: UDYAM-XX-00-1234567
```

### Contact Types

```typescript
// Phone number (international format)
zPhoneNumber
// Accepts: +1234567890, +91 98765 43210, (123) 456-7890
// Min: 10 digits, Max: 15 digits
```

### Location Types

```typescript
// Latitude coordinates
zLatitude
// Range: -90 to +90, up to 6 decimal places

// Longitude coordinates
zLongitude
// Range: -180 to +180, up to 6 decimal places
```

### Timestamp Types

```typescript
// Timestamps object
zTimestamps
// Returns: { createdAt: number, updatedAt: number }
// Use with .extend() for schemas needing timestamps
```

### Environment Enum

```typescript
// NodeEnv enum from node_env.ts
import { NodeEnv } from '@connected-repo/zod-schemas/node_env'

// Values: 'development' | 'production' | 'staging' | 'test'
```

## Usage Examples

### Basic Schema

```typescript
import { z } from 'zod'
import { zVarchar, zPrice } from '@connected-repo/zod-schemas/zod_utils'

const productSchema = z.object({
  name: zVarchar(3, 100),
  description: zText(10),
  price: zPrice,
  quantity: zQuantity,
})

export type Product = z.infer<typeof productSchema>
```

### With Timestamps

```typescript
import { z } from 'zod'
import { zVarchar, zTimestamps } from '@connected-repo/zod-schemas/zod_utils'

const userSchema = z.object({
  name: zVarchar(2, 50),
  email: z.string().email(),
  ...zTimestamps,
})

export type User = z.infer<typeof userSchema>
// Result: { name: string; email: string; createdAt: number; updatedAt: number }
```

### Compliance Validation

```typescript
import { z } from 'zod'
import { zGSTIN, zPAN, zPhoneNumber } from '@connected-repo/zod-schemas/zod_utils'

const businessSchema = z.object({
  businessName: zVarchar(3, 100),
  gstin: zGSTIN,
  pan: zPAN,
  contactPhone: zPhoneNumber,
})

// Validation
const result = businessSchema.safeParse({
  businessName: 'Acme Corp',
  gstin: '27AAPFU0939F1ZV',
  pan: 'ABCDE1234F',
  contactPhone: '+91 98765 43210',
})
```

### Custom Decimal Ranges

```typescript
import { zDecimal, zAmount } from '@connected-repo/zod-schemas/zod_utils'

// Percentage: 0-100 with 2 decimals
const percentageSchema = zDecimal(5, 2, 0, 100)

// Financial amount: Non-negative with 2 decimals
const transactionSchema = z.object({
  amount: zAmount(0.01), // Min 0.01
  discount: percentageSchema,
})
```

### Database Table Schema

```typescript
import { z } from 'zod'
import { zVarchar, zText, zPrice } from '@connected-repo/zod-schemas/zod_utils'

// For Orchid ORM table
export const createProductSchema = z.object({
  name: zVarchar(1, 255),
  description: zText(0),
  price: zPrice,
  sku: zVarchar(1, 50),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
```

## Adding New Validators

1. **Open appropriate file** (`zod_utils.ts` or create new file)
2. **Define validator function**:
   ```typescript
   export const zEmail = z.string().trim().email().toLowerCase()
   ```
3. **Add JSDoc if complex**:
   ```typescript
   /**
    * Validates email with normalization
    * - Trims whitespace
    * - Converts to lowercase
    * - Validates format
    */
   export const zEmail = z.string().trim().email().toLowerCase()
   ```
4. **Rebuild package**: `yarn build`
5. **Update this documentation**

## Type Inference

All validators support Zod's type inference:

```typescript
import { z } from 'zod'
import { zVarchar, zPrice } from '@connected-repo/zod-schemas/zod_utils'

const schema = z.object({
  name: zVarchar(1, 50),
  price: zPrice,
})

type Inferred = z.infer<typeof schema>
// Result: { name: string; price: string }
// Note: zPrice returns string due to decimal precision
```

## Validation Patterns

### Optional Fields

```typescript
import { zVarchar, zGSTIN } from '@connected-repo/zod-schemas/zod_utils'

const schema = z.object({
  name: zVarchar(1, 50),
  gstin: zGSTIN.optional(), // Optional GSTIN
})
```

### Nullable Fields

```typescript
import { zVarchar } from '@connected-repo/zod-schemas/zod_utils'

const schema = z.object({
  name: zVarchar(1, 50),
  middleName: zVarchar(1, 50).nullable(), // Can be null
})
```

### Default Values

```typescript
import { zInteger } from '@connected-repo/zod-schemas/zod_utils'

const schema = z.object({
  quantity: zInteger(0).default(1), // Defaults to 1
})
```

### Refinements

```typescript
import { zVarchar } from '@connected-repo/zod-schemas/zod_utils'

const schema = z.object({
  password: zVarchar(8, 100).refine(
    (val) => /[A-Z]/.test(val) && /[0-9]/.test(val),
    { message: 'Password must contain uppercase and number' }
  ),
})
```

## Error Handling

```typescript
import { zGSTIN } from '@connected-repo/zod-schemas/zod_utils'

const result = zGSTIN.safeParse('INVALID')

if (!result.success) {
  console.error(result.error.issues)
  // [{ message: 'Invalid GSTIN format', path: [], ... }]
}
```

## Known Limitations

1. **zDecimal precision check**: The precision validation may not handle scientific notation (e.g., `1e10`) correctly
2. **GSTIN validation**: Only validates format and checksum, not registration status
3. **Phone validation**: Basic format check, doesn't verify carrier/country codes

## Best Practices

1. ✅ Use database-aligned validators for consistency with Orchid ORM
2. ✅ Combine with `.optional()`, `.nullable()`, `.default()` as needed
3. ✅ Export both schema and inferred type from shared locations
4. ✅ Use `.safeParse()` for validation with error handling
5. ❌ Don't modify validator behavior after import (use `.refine()` instead)
6. ❌ Don't bypass validation with `any` or type assertions

## Development

```bash
# Build package
yarn build

# Watch mode
yarn dev

# Type check
yarn typecheck

# Lint
yarn lint
```

## Package Configuration

```json
{
  "name": "@connected-repo/zod-schemas",
  "type": "module",
  "sideEffects": false,
  "peerDependencies": {
    "zod": "^4.1.12"
  },
  "exports": {
    "./*": {
      "types": "./src/*.ts",
      "import": "./dist/*.js",
      "default": "./dist/*.js"
    }
  }
}
```

## Related Documentation

- [Zod Documentation](https://zod.dev/)
- [Orchid ORM Types](https://orchid-orm.netlify.app/guide/columns)
- [Parent CLAUDE.md](../CLAUDE.md)
