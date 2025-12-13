# Session Security Middleware

## Overview

The session security middleware validates device fingerprints and IP addresses to detect and prevent session hijacking attacks.

## Features

- **Device Fingerprint Validation**: Compares current device fingerprint with stored fingerprint
- **IP Address Monitoring**: Detects IP changes (with subnet tolerance for mobile users)
- **Configurable Security Levels**: Choose between lenient, moderate, and strict validation
- **Automatic Logging**: Suspicious activity is automatically logged for security monitoring

## Security Levels

Check out the [Security Levels Guide](./SECURITY_LEVELS_GUIDE.md) for more information.

## Usage in tRPC

### Regular Protected Endpoints
Use `protectedProcedure` for standard authenticated operations (no session security validation):

```typescript
import { protectedProcedure, trpcRouter } from "@backend/trpc";

export const usersRouterTrpc = trpcRouter({
  getAll: protectedProcedure.query(async () => {
    // Regular protected operation - only checks authentication
    // No device fingerprint validation
    return await db.user.select("userId", "email", "name");
  }),
});
```

### Sensitive Operations (STRICT Security)
Use `sensitiveProcedure` for operations requiring maximum security (blocks on ANY suspicious activity):

```typescript
import { sensitiveProcedure, trpcRouter } from "@backend/trpc";

export const accountRouterTrpc = trpcRouter({
  // Password change - requires STRICT security validation
  changePassword: sensitiveProcedure
    .input(passwordChangeSchema)
    .mutation(async ({ input, ctx }) => {
      // STRICT: Blocks on device OR IP changes
      await updatePassword(ctx.req.session.user.userId, input.newPassword);
      return { success: true };
    }),

  // Delete account - requires STRICT security validation
  deleteAccount: sensitiveProcedure.mutation(async ({ ctx }) => {
    // STRICT: Blocks on device OR IP changes
    await deleteUser(ctx.req.session.user.userId);
    return { success: true };
  }),

  // Process payment - requires STRICT security validation
  processPayment: sensitiveProcedure
    .input(paymentSchema)
    .mutation(async ({ input, ctx }) => {
      // STRICT: Blocks on device OR IP changes
      await processPayment(ctx.req.session.user.userId, input);
      return { success: true };
    }),
});
```

## Usage in Fastify (Global Hook)

To enable automatic validation for ALL requests:

```typescript
// apps/backend/src/app.ts
import { sessionSecurityHook, SessionSecurityLevel } from "@backend/middlewares/sessionSecurity.middleware";

// Add global security hook
app.addHook("onRequest", sessionSecurityHook(SessionSecurityLevel.LENIENT));
```

## Manual Validation

For custom validation logic:

```typescript
import { validateSessionSecurity, SessionSecurityLevel } from "@backend/middlewares/sessionSecurity.middleware";

app.get("/custom-endpoint", async (request, reply) => {
  const result = validateSessionSecurity(request, SessionSecurityLevel.MODERATE);

  if (result.isSuspicious) {
    // Handle suspicious activity
    request.log.warn({ reasons: result.reasons }, "Suspicious activity detected");
  }

  if (!result.isValid) {
    return reply.status(403).send({ error: "Session validation failed" });
  }

  // Proceed with request
});
```

## What Gets Validated

### Device Fingerprint
Based on:
- Browser name and version (normalized)
- Operating system
- Device type (mobile, tablet, desktop)
- Client hints (sec-ch-ua headers)
- Primary language preference

### IP Address
- Exact match required for strict mode
- /24 subnet tolerance for moderate/lenient (allows mobile network changes)
- Logs all IP changes for security monitoring

## Logging

All security events are logged with context:

## Best Practices

1. **Start with LENIENT**: Roll out with lenient mode to gather data without disrupting users
2. **Monitor Logs**: Review security logs to understand false positive rate
3. **Use sensitiveProcedure**: Apply to password changes, payment processing, admin actions
4. **Gradual Rollout**: Move from lenient → moderate → strict as you gain confidence
5. **User Communication**: Notify users of security monitoring in privacy policy

## Limitations

- **IPv4 only**: IPv6 subnet checking not yet implemented (treated as different)
- **Dynamic IPs**: Mobile users may trigger warnings when switching networks
- **Browser Updates**: Major browser updates may change fingerprints
- **Privacy Mode**: Users in incognito/private mode may have different fingerprints

## Future Enhancements

- [ ] IPv6 subnet support
- [ ] Geolocation-based validation
- [ ] Email alerts for suspicious activity
- [ ] Session limit per user
- [ ] Automatic session invalidation after X suspicious attempts
