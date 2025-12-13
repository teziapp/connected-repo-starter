import { publicProcedure } from '@backend/procedures/public.procedure';
import { auth } from './auth.config';

export const authRouter = {
	getSessionInfo: publicProcedure.handler(async ({ context }: any) => {
		// Convert headers to Headers object
		const headers = new Headers();
		if (context.reqHeaders) {
			context.reqHeaders.forEach((value: string, key: string) => {
				headers.set(key, value);
			});
		}

		const session = await auth.api.getSession({ headers });

		if (session?.user) {
			return {
				hasSession: true,
				user: {
					email: session.user.email,
					name: session.user.name,
					displayPicture: session.user.image,
				},
				isRegistered: true, // better-auth handles user registration
			};
		}

		return {
			hasSession: false,
			user: null,
			isRegistered: false,
		};
	}),

	logout: publicProcedure.handler(async ({ context }: any) => {
		// Convert headers to Headers object
		const headers = new Headers();
		if (context.reqHeaders) {
			context.reqHeaders.forEach((value: string, key: string) => {
				headers.set(key, value);
			});
		}

		await auth.api.signOut({ headers });
		return { success: true };
	}),
};