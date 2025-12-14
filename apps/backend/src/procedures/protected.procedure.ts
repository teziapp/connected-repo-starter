import { authMiddleware } from "@backend/modules/auth/auth.middleware";
import { ActiveSessionSelectAll } from "@backend/modules/auth/tables/session.auth.table";
import { ORPCContextWithHeaders, publicProcedure } from "@backend/procedures/public.procedure";
import { UserSelectAll } from "@connected-repo/zod-schemas/user.zod";

export interface AuthenticatedContext extends ORPCContextWithHeaders {
  session: ActiveSessionSelectAll;
  user: UserSelectAll;
}

// Protected procedure - requires authentication
export const protectedProcedure = publicProcedure
  .use(authMiddleware);
