import { initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

// Define user type
export const createTRPCContext = async ({
	req,
	res,
	info,
}: CreateFastifyContextOptions) => {
	const userId = req.headers["x-user-id"];

	return {
		req,
		res,
		info,
		userId,
	};
};

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

// Defining Middleware, Router and Procedures
const t = initTRPC.context<TrpcContext>().create();

// Public procedure with conditional rate limiting
export const publicProcedure = t.procedure.use(async (opts) => {
	return opts.next();
});

export const trpcRouter = t.router;
