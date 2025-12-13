import { ORPCContext } from '@backend/procedures/public.procedure';
import { MiddlewareNextFn, ORPCError } from '@orpc/server';
import { auth } from './auth.config';
import { extractClientInfo, generateDeviceFingerprint } from '@backend/utils/client-info.utils';

// Helper to convert headers to Web Headers and plain object
function convertHeaders(headers: Headers | Record<string, string | string[] | undefined> | undefined): {
	webHeaders: Headers;
	plainHeaders: Record<string, string | string[] | undefined>;
} {
	const plainHeaders: Record<string, string | string[] | undefined> = {};
	const webHeaders = new Headers();

	if (!headers) {
		return { webHeaders, plainHeaders };
	}

	if (headers instanceof Headers) {
		headers.forEach((value, key) => {
			webHeaders.set(key, value);
			plainHeaders[key] = value;
		});
	} else {
		for (const [key, value] of Object.entries(headers)) {
			if (value) {
				if (Array.isArray(value)) {
					const joined = value.join(', ');
					webHeaders.set(key, joined);
					plainHeaders[key] = value;
				} else {
					webHeaders.set(key, value);
					plainHeaders[key] = value;
				}
			}
		}
	}

	return { webHeaders, plainHeaders };
}

export const authMiddleware = async ({ context, next }: {context: ORPCContext, next: MiddlewareNextFn<unknown>}) => {
	// Convert headers to both Web Headers (for better-auth) and plain object (for client info utils)
	const { webHeaders, plainHeaders } = convertHeaders(context.reqHeaders);

	const sessionData = await auth.api.getSession({
		headers: webHeaders,
	});

	if (!sessionData?.session || !sessionData?.user) {
		throw new ORPCError('UNAUTHORIZED', {
			status: 401,
			message: 'User is not authenticated'
		});
	}

	// Extract client information for additional session fields
	const incomingHeaders = plainHeaders;
	const clientInfo = extractClientInfo(incomingHeaders);
	const deviceFingerprint = generateDeviceFingerprint(incomingHeaders);

	// Get client IP (this would typically come from a reverse proxy header)
	const xForwardedFor = incomingHeaders['x-forwarded-for'];
	const xRealIp = incomingHeaders['x-real-ip'];
	const clientIP = (typeof xForwardedFor === 'string' ? xForwardedFor : undefined) ||
		(typeof xRealIp === 'string' ? xRealIp : undefined) ||
		'unknown';

	// Extend session with additional fields
	const userAgent = incomingHeaders['user-agent'];
	const extendedSession = {
		...sessionData.session,
		email: sessionData.user.email,
		name: sessionData.user.name,
		displayPicture: sessionData.user.image,
		ipAddress: clientIP,
		userAgent: typeof userAgent === 'string' ? userAgent : undefined,
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