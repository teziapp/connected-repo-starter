import { db } from "@backend/db/db";
import { generateDeviceFingerprint, getClientIpAddress, parseUserAgent } from "@backend/utils/request-metadata.utils";
import type { FastifySessionObject } from "@fastify/session";
import type { FastifyRequest } from "fastify";

/**
 * User info stored in session
 */
export interface SessionUser {
	userId: string | null;
	email: string;
	name: string | null;
	displayPicture: string | null;
}

/**
 * Session metadata (device/security info)
 */
export interface SessionMetadata {
	ipAddress?: string;
	userAgent?: string;
	browser?: string;
	os?: string;
	device?: string;
	deviceFingerprint?: string;
}

/**
 * Augment Fastify types to include session
 */
declare module "fastify" {
	interface Session {
		user?: SessionUser;
		metadata?: SessionMetadata;
	}

	interface FastifyRequest {
		session: FastifySessionObject;
	}
};

/**
 * Store user info in session
 * This will automatically persist to database via the custom session store
 * Also captures IP address, user agent, and device fingerprint for security tracking
 */
export const setSession = (
	request: FastifyRequest,
	sessionUser: SessionUser,
) => {
	// Store user info in session (works with any OAuth provider)
	request.session.user = sessionUser;

	const userAgentString = request.headers["user-agent"] || "unknown";
	const parsedUA = parseUserAgent(userAgentString);

	// Automatically capture request metadata for security tracking
	request.session.metadata = {
		ipAddress: getClientIpAddress(request),
		userAgent: parsedUA.raw,
		browser: `${parsedUA.browser.name} ${parsedUA.browser.version}`,
		os: `${parsedUA.os.name} ${parsedUA.os.version}`,
		device: parsedUA.device.type,
		deviceFingerprint: generateDeviceFingerprint(request),
	};;
};

/**
 * Clear/destroy a single session
 * This marks the session as invalid in the database
 */
export function clearSession(request: FastifyRequest) {
	request.session.destroy();
}

/**
 * Invalidate all sessions for a specific user
 * Useful for forced logout across all devices
 */
export async function invalidateAllUserSessions(userId: string): Promise<number> {
	const result = await db.session
		.where({ userId, markedInvalidAt: null })
		.update({
			markedInvalidAt: new Date(),
			updatedAt: Date.now(),
		});

	return result;
}

/**
 * Update session with database user ID
 * Called after user registration to link session to database user
 * Updates both in-memory session and database record
 */
export async function updateSessionUserId(
	request: FastifyRequest,
	userId: string
): Promise<void> {
	if(!request.session.user) {
		throw new Error("No session user found to update userId");
	};

	// Update in-memory session
	request.session.user = {
		...request.session.user!,
		userId,
	};

	// Update database session record
	const sessionId = request.session.sessionId;
	if (sessionId) {
		await db.session
			.find(sessionId)
			.update({
				userId,
			});
	}
}
