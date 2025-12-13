import { ORPCError } from "@orpc/server";
import { publicProcedure } from "@backend/procedures/public.procedure";
import type { AuthenticatedContext } from "@backend/types/context.types";

// Protected procedure - requires authentication
export const protectedProcedure = publicProcedure.use(({ context, next }) => {
	if (!context.session?.user?.userId) {
		throw new ORPCError("UNAUTHORIZED", {
			status: 401,
			message: "User is not authenticated",
		});
	}

	return next({
		context: {
			...context,
			user: context.session.user as AuthenticatedContext["user"],
		} as AuthenticatedContext,
	});
});
