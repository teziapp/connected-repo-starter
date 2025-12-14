import { sessionSecurityMiddleware } from "@backend/middlewares/session-security.middleware";
import { protectedProcedure } from "@backend/procedures/protected.procedure";

export const sensitiveProcedure = protectedProcedure
	.use(sessionSecurityMiddleware("strict"));
