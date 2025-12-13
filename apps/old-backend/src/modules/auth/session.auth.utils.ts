import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { generateDeviceFingerprint, getClientIpAddress, parseUserAgent } from "@backend/utils/request-metadata.utils";
import type { FastifySessionObject } from "@fastify/session";
import { TRPCError } from "@trpc/server";
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
	};
};

/**
 * Clear/destroy a single session and regenerate a new one
 * This marks the old session as invalid and creates a new session with a new ID
 */
export async function clearSession(request: FastifyRequest): Promise<void> {
	// Regenerate creates a new session with a new sessionId
	// The old session will be marked invalid in the database
	// Needed for when the user logs out and the existing session is marked invalid.
	await new Promise<void>((resolve, reject) => {
		request.session.regenerate((err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}

/**
 * Invalidate all sessions for a specific user
 * Useful for forced logout across all devices
 */
export async function invalidateAllUserSessions(userId: string): Promise<number> {
	const result = await db.sessions
		.where({ userId, markedInvalidAt: null })
		.update({
			markedInvalidAt: () => sql`NOW()`,
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
	if (!request.session.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "No session user found to update userId"
		});
	}

	const sessionId = request.session.sessionId;
	if (!sessionId) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Session ID not found"
		});
	}

	// Update database FIRST - prevents race condition where in-memory has userId but DB doesn't
	await db.sessions.find(sessionId).update({ userId });

	// Only update in-memory session if DB update succeeded
	request.session.user = {
		...request.session.user,
		userId,
	};
}
