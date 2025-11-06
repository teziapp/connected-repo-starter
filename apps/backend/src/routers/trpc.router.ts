import { authRouterTrpc } from "@backend/modules/auth/auth.trpc";
import { journalEntriesRouterTrpc } from "@backend/modules/journal-entries/journal_entries.trpc";
import { promptsRouterTrpc } from "@backend/modules/journal-entries/prompts.trpc";
import { usersRouterTrpc } from "@backend/modules/users/users.trpc";
import { publicProcedure, trpcRouter } from "@backend/trpc";
//import { tracing } from "./tracing-middleware";


export const appTrpcRouter = trpcRouter({
	hello: publicProcedure.query(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return "Hello from tRPC";
	}),

	// Auth routes
	auth: authRouterTrpc,

	// User routes
	users: usersRouterTrpc,

	// Prompts routes
	prompts: promptsRouterTrpc,

	// Journal entries routes
	journalEntries: journalEntriesRouterTrpc,
});

export type AppTrpcRouter = typeof appTrpcRouter;
// export type RouterOutputs = inferRouterOutputs<AppTrpcRouter>;
