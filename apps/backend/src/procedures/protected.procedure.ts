import { authMiddleware } from "@backend/modules/auth/auth.middleware";
import { ORPCContext, publicProcedure, ExtendedSession } from "@backend/procedures/public.procedure";
import type { User } from "better-auth";

// Context for authenticated procedures
export interface AuthenticatedContext extends ORPCContext {
	session?: ExtendedSession;
	user?: User;
}


// Protected procedure - requires authentication
export const protectedProcedure = publicProcedure
  .$context<AuthenticatedContext>()
  .use(authMiddleware);
