import { ActiveSessionSelectAll } from "@backend/modules/auth/tables/session.auth.table";
import { UserSelectAll } from "@connected-repo/zod-schemas/user.zod";
import { os } from "@orpc/server";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";
import z from "zod";

export interface ORPCContext extends RequestHeadersPluginContext {
	session?: ActiveSessionSelectAll;
	user?: UserSelectAll;
}

export interface ORPCContextWithHeaders extends ORPCContext {
	reqHeaders: Headers;
}

export const baseOrpc = os.$context<ORPCContext>()

// Public procedure with context
export const publicProcedure = baseOrpc
	.use(({ context, next }) => {
		const reqHeaders = context.reqHeaders ?? new Headers();
		// You can add any public middleware logic here if needed
		return next({ 
			context: {
				...context, 
				reqHeaders
			} 
		});
	})
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
