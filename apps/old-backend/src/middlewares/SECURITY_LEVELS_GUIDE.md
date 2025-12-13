# Session Security Levels - Quick Reference Guide

## Visual Decision Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                    SECURITY LEVEL COMPARISON                   │
├─────────────────┬─────────────┬─────────────┬──────────────────┤
│ Event Type      │  LENIENT    │  MODERATE   │     STRICT       │
├─────────────────┼─────────────┼─────────────┼──────────────────┤
│ Device Change   │  LOG ONLY   │   BLOCK     │     BLOCK        │
│ (Fingerprint)   │  ✓ Allow    │   ✗ Deny    │     ✗ Deny       │
├─────────────────┼─────────────┼─────────────┼──────────────────┤
│ IP Change       │  LOG ONLY   │   WARN      │     BLOCK        │
│ (Same subnet)   │  ✓ Allow    │   ✓ Allow   │     ✗ Deny       │
├─────────────────┼─────────────┼─────────────┼──────────────────┤
│ IP Change       │  LOG ONLY   │   WARN      │     BLOCK        │
│ (Diff subnet)   │  ✓ Allow    │   ✓ Allow   │     ✗ Deny       │
└─────────────────┴─────────────┴─────────────┴──────────────────┘
```

## When to Use Each Level

### 🟢 LENIENT - Analytics & Monitoring Phase
**Use when:**
- Initial rollout of security features
- Gathering baseline data on user behavior
- Understanding false positive rates
- Development/staging environments

**Don't use when:**
- Production with sensitive data
- Real security threats exist
- Compliance requirements are strict

---

### 🟡 MODERATE - Production Standard (RECOMMENDED)
**Use when:**
- Production applications with normal security needs
- Balance between security and user experience is critical
- Users may legitimately change networks (mobile, VPN, home/office)
- You want to prevent session hijacking without annoying users

**Security Guarantees:**
- ✅ **BLOCKS session hijacking** (different device/browser)
- ✅ **ALLOWS network changes** (traveling users, mobile networks)
- ✅ **LOGS all suspicious activity** for monitoring

---

### 🔴 STRICT - Maximum Security
**Use when:**
- Password changes
- Payment processing
- Account deletion
- Admin operations
- GDPR data export
- Two-factor authentication changes
- API key generation

**Security Guarantees:**
- ✅ **BLOCKS any suspicious activity**
- ✅ **Zero tolerance for device OR network changes**
- ✅ **Maximum protection for sensitive operations**

**Trade-offs:**
- ❌ Users on VPN may get blocked
- ❌ Mobile users switching networks get blocked
- ❌ May require re-authentication frequently

---

## Implementation Examples

### Scenario 1: E-commerce Application

```typescript
export const ecommerceRouterTrpc = trpcRouter({
  // Browsing products - no security validation needed
  getProducts: publicProcedure.query(async () => {
    return await db.product.getAll();
  }),

  // View cart - authentication only
  getCart: protectedProcedure.query(async ({ ctx }) => {
    return await db.cart.getByUserId(ctx.req.session.user.userId);
  }),

  // Add to cart - MODERATE security (block hijacking, allow network changes)
  addToCart: protectedProcedure
    .use(sessionSecurityMiddleware(SessionSecurityLevel.MODERATE))
    .mutation(async ({ ctx, input }) => {
      return await db.cart.addItem(ctx.req.session.user.userId, input);
    }),

  // Checkout - STRICT security (any suspicious activity blocks)
  checkout: sensitiveProcedure
    .mutation(async ({ ctx, input }) => {
      // Uses STRICT automatically
      return await processCheckout(ctx.req.session.user.userId, input);
    }),
});
```

### Scenario 2: SaaS Dashboard

```typescript
export const dashboardRouterTrpc = trpcRouter({
  // View dashboard - MODERATE (typical for most operations)
  getDashboard: protectedProcedure
    .use(sessionSecurityMiddleware(SessionSecurityLevel.MODERATE))
    .query(async ({ ctx }) => {
      return await db.dashboard.getData(ctx.req.session.user.userId);
    }),

  // Update profile - MODERATE (not super sensitive)
  updateProfile: protectedProcedure
    .use(sessionSecurityMiddleware(SessionSecurityLevel.MODERATE))
    .mutation(async ({ ctx, input }) => {
      return await db.user.update(ctx.req.session.user.userId, input);
    }),

  // Billing settings - STRICT
  updateBilling: sensitiveProcedure
    .mutation(async ({ ctx, input }) => {
      return await db.billing.update(ctx.req.session.user.userId, input);
    }),

  // API key generation - STRICT
  generateApiKey: sensitiveProcedure
    .mutation(async ({ ctx }) => {
      return await db.apiKey.create(ctx.req.session.user.userId);
    }),
});
```

### Scenario 3: Healthcare Application (High Compliance)

```typescript
export const healthcareRouterTrpc = trpcRouter({
  // All operations use at least MODERATE
  getPatientData: protectedProcedure
    .use(sessionSecurityMiddleware(SessionSecurityLevel.MODERATE))
    .query(async ({ ctx, input }) => {
      return await db.patient.getById(input.patientId);
    }),

  // Viewing medical records - STRICT
  getMedicalRecords: sensitiveProcedure
    .query(async ({ ctx, input }) => {
      return await db.medicalRecord.getByPatientId(input.patientId);
    }),

  // Prescribing medication - STRICT
  prescribeMedication: sensitiveProcedure
    .mutation(async ({ ctx, input }) => {
      return await db.prescription.create(input);
    }),

  // Exporting patient data (GDPR) - STRICT
  exportPatientData: sensitiveProcedure
    .mutation(async ({ ctx, input }) => {
      return await exportData(input.patientId);
    }),
});
```