import type { AppContext } from "@backend/types/context.types";
import { getClientIpAddress } from "@backend/utils/request-metadata.utils";
import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit";
import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";
import { os } from "@orpc/server";
import z from "zod";

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
		console.log({ip});
		return ip || "global";
	},
});

// Public procedure with context and global rate limiting
export const publicProcedure = os
	.$context<AppContext>()
	// Phase 2: Re-enable session middleware
	// .use(sessionMiddleware)
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
