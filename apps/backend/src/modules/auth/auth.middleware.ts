import { ORPCContextWithHeaders } from '@backend/procedures/public.procedure';
import { MiddlewareNextFn, ORPCError } from '@orpc/server';
import { auth } from './auth.config';

export const authMiddleware = async ({ context, next }: {context: ORPCContextWithHeaders, next: MiddlewareNextFn<unknown>}) => {
	const reqHeaders = context.reqHeaders;

	const sessionData = await auth.api.getSession({
		headers: reqHeaders,
	});

	if (!sessionData?.session || !sessionData?.user) {
		throw new ORPCError('UNAUTHORIZED', {
			status: 401,
			message: 'User is not authenticated'
		});
	}

	const session = {
		...sessionData.session,
		userAgent: sessionData.session.userAgent ?? null,
		ipAddress: sessionData.session.ipAddress ?? null,
		browser: sessionData.session.browser ?? null,
		deviceFingerprint: sessionData.session.deviceFingerprint ?? null,
		os: sessionData.session.os ?? null,
		device: sessionData.session.device ?? null,
		createdAt: new Date(sessionData.session.createdAt).getTime(),
		updatedAt: new Date(sessionData.session.expiresAt).getTime(),
		markedInvalidAt: sessionData.session.markedInvalidAt ? new Date(sessionData.session.markedInvalidAt).getTime() : null,
		expiresAt: new Date(sessionData.session.expiresAt).getTime(),
	};

	const user = {
		...sessionData.user,
		image: sessionData.user.image ?? null,
		createdAt: new Date(sessionData.user.createdAt).getTime(),
		updatedAt: new Date(sessionData.user.updatedAt).getTime(),
	}

	return next({
		context: {
			...context,
			session,
			user,
		},
	});
};