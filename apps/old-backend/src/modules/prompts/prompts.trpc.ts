import { db } from "@backend/db/db";
import { publicProcedure, trpcRouter } from "@backend/trpc";
import {
	promptGetActiveZod,
	promptGetByIdZod,
} from "@connected-repo/zod-schemas/prompt.zod";

export const promptsRouterTrpc = trpcRouter({
	// Get all active prompts
	getAllActive: publicProcedure.query(async () => {
		const prompts = await db.prompts
			.where({ isActive: true })
			.select("*")
			.order({ createdAt: "DESC" });

		return prompts;
	}),

	// Get a random active prompt
	getRandomActive: publicProcedure.query(async () => {
		// Get count of active prompts
		const count = await db.prompts
			.count();

		if (count === 0) {
			throw new Error("No active prompts available");
		}

		// Try up to 3 times to get a random prompt
		for (let attempt = 0; attempt < 3; attempt++) {
			// Generate random offset between 0 and count-1
			const randomIndex = Math.floor(Math.random() * count);

			// Get the first active prompt at this offset
			const prompt = await db.prompts
				.where({ isActive: true, promptId: {gte: randomIndex} })
				.select("*")
				.limit(1)
				.take();

			if (prompt) {
				return prompt;
			}
		}

		// If all 3 attempts failed, throw error
		throw new Error("Failed to retrieve a random active prompt after 3 attempts");
	}),

	// Get prompt by ID
	getById: publicProcedure
		.input(promptGetByIdZod)
		.query(async ({ input: { promptId } }) => {
			const prompt = await db.prompts.find(promptId);

			if (!prompt) {
				throw new Error("Prompt not found");
			}

			return prompt;
		}),

	// Get prompts by category
	getByCategory: publicProcedure
		.input(promptGetActiveZod)
		.query(async ({ input }) => {
			const prompts = await db.prompts
				.where({ isActive: input.isActive })
				.select("*")
				.order({ createdAt: "DESC" });

			return prompts;
		}),
});
