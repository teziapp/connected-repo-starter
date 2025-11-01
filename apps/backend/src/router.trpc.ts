import { postsRouterTrpc } from "@backend/modules/posts/posts.trpc";
import { usersRouterTrpc } from "@backend/modules/users/users.trpc";
import { publicProcedure, trpcRouter } from "@backend/trpc";
//import { tracing } from "./tracing-middleware";


export const appTrpcRouter = trpcRouter({
	hello: publicProcedure.query(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return "Hello from tRPC";
	}),

	// User routes
	users: usersRouterTrpc,

	// Post routes
	posts: postsRouterTrpc,
});

export type AppTrpcRouter = typeof appTrpcRouter;
// export type RouterOutputs = inferRouterOutputs<AppTrpcRouter>;
