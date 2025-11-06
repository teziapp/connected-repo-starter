import { authRouterTrpc } from "@backend/modules/auth/auth.trpc";
import { journalEntriesRouterTrpc } from "@backend/modules/journal-entries/journal_entries.trpc";
import { promptsRouterTrpc } from "@backend/modules/prompts/prompts.trpc";
import { usersRouterTrpc } from "@backend/modules/users/users.trpc";
import { publicProcedure, trpcRouter } from "@backend/trpc";
//import { tracing } from "./tracing-middleware";


export const appTrpcRouter = trpcRouter({
	hello: publicProcedure.query(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return "Hello from tRPC";
	}),

	auth: authRouterTrpc,
	journalEntries: journalEntriesRouterTrpc,
	prompts: promptsRouterTrpc,
	users: usersRouterTrpc,
});

export type AppTrpcRouter = typeof appTrpcRouter;
// export type RouterOutputs = inferRouterOutputs<AppTrpcRouter>;
