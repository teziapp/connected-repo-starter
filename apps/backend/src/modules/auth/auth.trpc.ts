import { publicProcedure, trpcRouter } from "@backend/trpc";

export const authRouterTrpc = trpcRouter({
	// Get current session info (for pre-filling registration form)
	getSessionInfo: publicProcedure.query(async ({ ctx }) => {
		// Return session user data if session exists
		if (ctx.req.session?.user) {
			return {
				hasSession: true,
				user: {
					email: ctx.req.session.user.email,
					name: ctx.req.session.user.name,
					picture: ctx.req.session.user.displayPicture,
				},
				isRegistered: !!ctx.req.session.user.userId, // Has database userId
			};
		}

		return {
			hasSession: false,
			user: null,
			isRegistered: false,
		};
	}),
});
