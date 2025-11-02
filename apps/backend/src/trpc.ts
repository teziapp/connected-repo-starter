import { isDev } from "@backend/configs/env.config";
import { SessionSecurityLevel, validateSessionSecurity } from "@backend/middlewares/sessionSecurity.middleware";
import { trpcErrorParser } from "@backend/utils/errorParser";
import { getClientIpAddress } from "@backend/utils/request-metadata.utils";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { BurstyRateLimiter, RateLimiterMemory } from "rate-limiter-flexible";

// Define user type
export const createTRPCContext = (input: CreateFastifyContextOptions) => {
	const userId = input.req.headers["x-user-id"];

	return {
		req: input.req,
		res: input.res,
		userId,
	}
};

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

// Defining Middleware, Router and Procedures
const t = initTRPC.context<TrpcContext>().create({
	errorFormatter: ({ shape, error }) => {
		// Parse and transform the error
		const customError = trpcErrorParser(error);

		// FIXME: The present implementation send the correct error to frontend but the error logging at apps/backend/src/app.ts is not working as expected.
		// console.log(error.cause);
		// console.log(error.stack);

		return {
			...shape,
			message: customError.message,
			data: {
				...shape.data,
				code: customError.code,
				details: customError.details,
				httpStatus: customError.httpStatus || shape.data.httpStatus,
				// Add any custom fields you need
				userFriendlyMessage: customError.userFriendlyMessage,
				actionRequired: customError.actionRequired,
				stack: isDev ? error.stack : undefined,
			},
			// code: customError.code,
		};
	},
	isServer: true,
	isDev,
});

// Database error middleware - now simplified since error parsing is centralized
export const centralTrpcErrorMiddleware = t.middleware(async ({ next }) => {
	try {
		return await next();
	} catch (cause) {
		// Convert any unknown error to TRPCError so our errorFormatter can handle it
		if (cause instanceof TRPCError) {
			throw cause;
		}

		// Convert other errors to TRPCError with the original cause preserved
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: cause instanceof Error ? cause.message : "An unexpected error occurred",
			cause,
		});
	}
});

export const publicProcedure = t.procedure.use(centralTrpcErrorMiddleware).use(async (opts) => {
	return opts.next();
});

export const trpcRouter = t.router;

// isAuthenticated middleware
const isAuthenticatedMiddleware = t.middleware(({ ctx, next }) => {
	if (!ctx.req.session.user?.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not authenticated" });
	}
	return next();
});

/**
 * Session security middleware - validates device fingerprint and IP for suspicious activity
 * Uses MODERATE mode by default to avoid disrupting user experience
 * For sensitive operations, use sensitiveProcedure instead
 */
const sessionSecurityMiddleware = (securityLevel: SessionSecurityLevel = SessionSecurityLevel.MODERATE) => t.middleware(({ ctx, next }) => {
	const result = validateSessionSecurity(ctx.req, securityLevel);

	if (result.action === "block") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Session security validation failed. Please log in again.",
		});
	}

	return next();
});

// Protected procedure with database error handling
export const protectedProcedure = publicProcedure.use(isAuthenticatedMiddleware);

/**
 * Sensitive procedure - for operations requiring additional security validation
 * Use this for: password changes, account deletion, payment processing, admin actions, etc.
 */
export const sensitiveProcedure = protectedProcedure.use(sessionSecurityMiddleware(SessionSecurityLevel.STRICT));

/**
 * Rate limiting middleware for tRPC procedures
 * Uses rate-limiter-flexible with in-memory storage
 */
const rateLimiters = {
	moderate: new BurstyRateLimiter(
		new RateLimiterMemory({ points: 20, duration: 60 }), // 20 req/min
		new RateLimiterMemory({ keyPrefix: "burst", points: 5, duration: 120 }),
	),
	strict: new BurstyRateLimiter(
		new RateLimiterMemory({ points: 5, duration: 60 }), // 5 req/min
		new RateLimiterMemory({ keyPrefix: "burst", points: 2, duration: 300 }),
	),
};

export const moderateRateLimit = t.middleware(async ({ ctx, next }) => {
	const ip = getClientIpAddress(ctx.req);
	try {
		await rateLimiters.moderate.consume(ip);
		return next();
	} catch {
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: "Too many requests. Please try again later.",
		});
	}
});

export const strictRateLimit = t.middleware(async ({ ctx, next }) => {
	const ip = getClientIpAddress(ctx.req);
	try {
		await rateLimiters.strict.consume(ip);
		return next();
	} catch {
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: "Too many attempts. Please wait and try again.",
		});
	}
});
