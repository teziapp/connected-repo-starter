import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import type { AppContext, DatabaseSession } from "@backend/types/context.types";
import { getClientIpAddress } from "@backend/utils/request-metadata.utils";
import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit";
import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";
import { os } from "@orpc/server";
import z from "zod";

// Helper: Parse cookie header
function parseCookie(cookieHeader?: string): Record<string, string> {
	if (!cookieHeader) return {};
	return cookieHeader.split(";").reduce(
		(acc, cookie) => {
			const [key, value] = cookie.trim().split("=");
			if (key && value) acc[key] = decodeURIComponent(value);
			return acc;
		},
		{} as Record<string, string>,
	);
}

// Global rate limiter: 10 requests per 60 seconds
const globalLimiter = new MemoryRatelimiter({
	maxRequests: 10,
	window: 60000, // 60 seconds
});

// Global rate limit middleware
const globalRateLimit = createRatelimitMiddleware({
	limiter: globalLimiter,
	key: ({ context }: { context: AppContext }) => {
		const ip = getClientIpAddress(context.headers);
		console.log({ ip });
		return ip || "global";
	},
});

// Public procedure with context and session loading
export const publicProcedure = os
	.$context<AppContext>()
	// Session loading middleware (Phase 1)
	.use(async ({ context, next }) => {
		const cookieHeader =
			typeof context.headers.cookie === "string" ? context.headers.cookie : undefined;
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
					context: { ...context, sessionId, session: null } as AppContext,
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

			// Touch session to extend expiry (async)
			db.sessions
				.findBy({ sessionId })
				.update({ expiresAt: () => sql`NOW() + INTERVAL '30 days'` })
				.catch(() => {});

			return next({ context: { ...context, sessionId, session } as AppContext });
		} catch (error) {
			console.error("Session middleware error:", error);
			return next({
				context: { ...context, sessionId: undefined, session: null } as AppContext,
			});
		}
	})
	// FIXME: Using rate-limit throws an error. Try later at the end.
	// .use(globalRateLimit)
	.errors({
		INPUT_VALIDATION_FAILED: {
			status: 422,
			data: z.object({
				formErrors: z.array(z.string()),
				fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
			}),
		},
		OUTPUT_VALIDATION_FAILED: {
			status: 500,
			data: z.object({
				formErrors: z.array(z.string()),
				fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
			}),
		},
		RATE_LIMITED: {
			status: 429,
		},
	});
