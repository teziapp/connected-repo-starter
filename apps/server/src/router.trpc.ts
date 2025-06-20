import { publicProcedure, trpcRouter } from "./trpc";

export const appTrpcRouter = trpcRouter({
	hello: publicProcedure.query(() => "Hello from tRPC"),
});

export type AppTrpcRouter = typeof appTrpcRouter;
// export type RouterOutputs = inferRouterOutputs<AppTrpcRouter>;
