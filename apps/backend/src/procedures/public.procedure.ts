import { os } from "@orpc/server";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";
import type { Session, User } from "better-auth";
import z from "zod";

export interface ORPCContext extends RequestHeadersPluginContext {
	session?: Session | null;
	user?: User | null;
}

export const baseOrpc = os.$context<ORPCContext>()

// Public procedure with context
export const publicProcedure = baseOrpc
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
