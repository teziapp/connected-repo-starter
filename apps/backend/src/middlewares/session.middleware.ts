import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import type { AppContext, DatabaseSession } from "@backend/types/context.types";
import { os } from "@orpc/server";

/**
 * Parse cookie header to extract session ID
 */
function parseCookie(cookieHeader?: string): Record<string, string> {
	if (!cookieHeader) return {};

	return cookieHeader.split(";").reduce(
		(acc, cookie) => {
			const [key, value] = cookie.trim().split("=");
			if (key && value) {
				acc[key] = decodeURIComponent(value);
			}
			return acc;
		},
		{} as Record<string, string>,
	);
}

/**
 * Session middleware for oRPC
 * Loads session from database and injects into context
 */
export const sessionMiddleware = os.$context<AppContext>().use(async ({ context, next }) => {
	const cookieHeader =
		typeof context.headers.cookie === "string" ? context.headers.cookie : undefined;

	// Parse cookies to get session ID
	const cookies = parseCookie(cookieHeader);
	const sessionId = cookies["connect.sid"];

	// If no session ID, continue without session
	if (!sessionId) {
		return next({
			context: {
				...context,
				sessionId: undefined,
				session: null,
			} as AppContext,
		});
	}

	try {
		// Load session from database
		const sessionData = await db.sessions
			.select("*", {
				user: (q) => q.user.select("name", "displayPicture"),
			})
			.where({
				sessionId,
				markedInvalidAt: null,
			})
			.where({ expiresAt: { gt: sql`NOW()` } })
			.take();

		// Session not found or invalid
		if (!sessionData) {
			return next({
				context: {
					...context,
					sessionId,
					session: null,
				} as AppContext,
			});
		}

		// Reconstruct session object
		const session: DatabaseSession = {
			sessionId: sessionData.sessionId,
			user: {
				userId: sessionData.userId || undefined,
				email: sessionData.email,
				name: sessionData.user?.name ?? sessionData.name,
				profilePictureUrl: sessionData.user?.displayPicture ?? sessionData.displayPicture,
			},
			createdAt: new Date(sessionData.createdAt).getTime(),
			expiresAt: new Date(sessionData.expiresAt).getTime(),
			ipAddress: sessionData.ipAddress || undefined,
			userAgent: sessionData.userAgent || undefined,
			browser: sessionData.browser || undefined,
			os: sessionData.os || undefined,
			device: sessionData.device || undefined,
			fingerprint: sessionData.deviceFingerprint || undefined,
		};

		// Touch session to extend expiry (async, don't wait)
		db.sessions
			.findBy({ sessionId })
			.update({ expiresAt: () => sql`NOW() + INTERVAL '30 days'` })
			.catch(() => {
				// Ignore errors in touch operation
			});

		return next({
			context: {
				...context,
				sessionId,
				session,
			} as AppContext,
		});
	} catch (error) {
		// On error, continue without session
		console.error("Session middleware error:", error);
		return next({
			context: {
				...context,
				sessionId: undefined,
				session: null,
			} as AppContext,
		});
	}
});
