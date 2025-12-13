import { ORPCContext } from '@backend/procedures/public.procedure';
import { MiddlewareNextFn, ORPCError } from '@orpc/server';
import { auth } from './auth.config';

export const authMiddleware = async ({ context, next }: {context: ORPCContext, next: MiddlewareNextFn<unknown>}) => {
	// Convert headers to Headers object
	const headers = new Headers();
	if (context.reqHeaders) {
		context.reqHeaders.forEach((value, key) => {
			headers.set(key, value);
		});
	}

	const sessionData = await auth.api.getSession({
		headers,
	});

	if (!sessionData?.session || !sessionData?.user) {
		throw new ORPCError('UNAUTHORIZED', {
			status: 401,
			message: 'User is not authenticated'
		});
	}

	return next({
		context: {
			...context,
			session: sessionData.session,
			user: sessionData.user,
		},
	});
};