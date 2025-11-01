import { isDev } from "@backend/configs/env.config";
import { trpcErrorParser } from "@backend/utils/errorParser";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

// Define user type
export const createTRPCContext = (input: CreateFastifyContextOptions) => {
	const userId = input.req.headers["x-user-id"];

	return {
		...input,
		userId,
	} as {
		req: CreateFastifyContextOptions["req"];
		res: CreateFastifyContextOptions["res"];
		info: CreateFastifyContextOptions["info"];
		userId: string;
	};
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

export const publicProcedure = t.procedure.use(async (opts) => {
	return opts.next();
});

export const trpcRouter = t.router;

// Database error middleware - now simplified since error parsing is centralized
export const dbErrorMiddleware = t.middleware(async ({ next }) => {
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

// Protected procedure with database error handling
export const protectedProcedure = publicProcedure.use(dbErrorMiddleware);
