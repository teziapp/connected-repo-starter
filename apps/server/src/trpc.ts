import { initTRPC } from "@trpc/server";
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

const t = initTRPC.context<TrpcContext>().create();

export const publicProcedure = t.procedure.use(async (opts) => {
	return opts.next();
});

export const trpcRouter = t.router;
