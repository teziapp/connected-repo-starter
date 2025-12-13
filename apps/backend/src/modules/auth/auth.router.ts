import { env } from '@backend/configs/env.config';
import { publicProcedure } from '@backend/procedures/public.procedure';
import { z } from 'zod';
import { auth } from './auth.config';

// Helper to convert headers to Web Headers
function convertHeaders(headers: Headers | Record<string, string | string[] | undefined> | undefined): Headers {
	const webHeaders = new Headers();

	if (!headers) {
		return webHeaders;
	}

	if (headers instanceof Headers) {
		return headers;
	}

	for (const [key, value] of Object.entries(headers)) {
		if (value) {
			if (Array.isArray(value)) {
				webHeaders.set(key, value.join(', '));
			} else {
				webHeaders.set(key, value);
			}
		}
	}

	return webHeaders;
}

export const getSessionInfo = publicProcedure.handler(async ({ context }) => {
	// Convert headers to Web Headers
	const headers = convertHeaders(context.reqHeaders);

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
});

export const logout = publicProcedure.handler(async ({ context }) => {
	// Convert headers to Web Headers
	const headers = convertHeaders(context.reqHeaders);

	await auth.api.signOut({ headers });
	return { success: true };
});

export const authRouter = {
  getSessionInfo,
  logout,
};