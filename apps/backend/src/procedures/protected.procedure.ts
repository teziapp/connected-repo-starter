import { authMiddleware } from "@backend/modules/auth/auth.middleware";
import { ORPCContext, publicProcedure } from "@backend/procedures/public.procedure";
import type { Session, User } from "better-auth";

// Context for authenticated procedures
export interface AuthenticatedContext extends ORPCContext {
	session?: Session;
	user?: User;
}


// Protected procedure - requires authentication
export const protectedProcedure = publicProcedure
  .$context<AuthenticatedContext>()
  .use(authMiddleware);
