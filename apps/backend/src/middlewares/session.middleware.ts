import { os } from "@orpc/server";
import type { AppContext } from "@backend/types/context.types";

// Phase 1: Placeholder session middleware
// Phase 2: Will implement full session loading from database
export const sessionMiddleware = os.use(async ({ context, next }) => {
	// For Phase 1, just pass through without session
	// In Phase 2, this will:
	// 1. Parse cookie from context.headers.cookie
	// 2. Load session from DatabaseSessionStore
	// 3. Inject session into context

	return next({
		context: {
			...context,
			sessionId: undefined,
			session: null,
		} as AppContext,
	});
});
