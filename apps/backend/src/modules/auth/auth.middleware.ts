import { ORPCContext } from '@backend/procedures/public.procedure';
import { MiddlewareNextFn, ORPCError } from '@orpc/server';
import { auth } from './auth.config';
import { extractClientInfo, generateDeviceFingerprint } from '@backend/utils/client-info.utils';

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

	// Extract client information for additional session fields
	const incomingHeaders = context.reqHeaders ? Object.fromEntries(context.reqHeaders.entries()) : {};
	const clientInfo = extractClientInfo(incomingHeaders);
	const deviceFingerprint = generateDeviceFingerprint(incomingHeaders);

	// Get client IP (this would typically come from a reverse proxy header)
	const clientIP = incomingHeaders['x-forwarded-for'] ||
		incomingHeaders['x-real-ip'] ||
		'unknown';

	// Extend session with additional fields
	const extendedSession = {
		...sessionData.session,
		email: sessionData.user.email,
		name: sessionData.user.name,
		displayPicture: sessionData.user.image,
		ipAddress: clientIP,
		userAgent: incomingHeaders['user-agent'],
		browser: clientInfo.browser,
		os: clientInfo.os,
		device: clientInfo.device,
		deviceFingerprint,
	};

	return next({
		context: {
			...context,
			session: extendedSession,
			user: sessionData.user,
		},
	});
};