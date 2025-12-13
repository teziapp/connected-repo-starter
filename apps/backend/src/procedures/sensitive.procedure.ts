import { protectedProcedure } from "@backend/procedures/protected.procedure";

// Sensitive procedure - requires authentication + additional security checks
// Phase 1: Basic implementation
// Phase 2: Will add session security middleware (device fingerprinting, IP validation, etc.)
export const sensitiveProcedure = protectedProcedure.use(({ context, next }) => {
	// Phase 2: Add session security checks here
	// - Verify device fingerprint
	// - Check IP address consistency
	// - Validate user agent
	// - Check for suspicious activity

	return next({
		context,
	});
});
