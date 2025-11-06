import { db } from "@backend/db/db";
import { protectedProcedure, trpcRouter } from "@backend/trpc";
import {
	promptCreateInputZod,
	promptGetActiveZod,
	promptGetByCategoryZod,
	promptGetByIdZod,
} from "@connected-repo/zod-schemas/prompt.zod";

export const promptsRouterTrpc = trpcRouter({
	// Get all prompts
	getAll: protectedProcedure.query(async () => {
		const prompts = await db.prompts.select("*").order({ createdAt: "DESC" });
		return prompts;
	}),

	// Get active prompts only
	getActive: protectedProcedure
		.input(promptGetActiveZod)
		.query(async ({ input }) => {
			const prompts = await db.prompts
				.select("*")
				.where({ isActive: input.isActive })
				.order({ createdAt: "DESC" });
			return prompts;
		}),

	// Get prompt by ID
	getById: protectedProcedure
		.input(promptGetByIdZod)
		.query(async ({ input: { promptId } }) => {
			const prompt = await db.prompts.find(promptId);

			if (!prompt) {
				throw new Error("Prompt not found");
			}

			return prompt;
		}),

	// Get prompts by category
	getByCategory: protectedProcedure
		.input(promptGetByCategoryZod)
		.query(async ({ input }) => {
			const prompts = await db.prompts
				.select("*")
				.where({ category: input.category })
				.order({ createdAt: "DESC" });

			return prompts;
		}),

	// Create prompt
	create: protectedProcedure
		.input(promptCreateInputZod)
		.mutation(async ({ input }) => {
			const newPrompt = await db.prompts.create({
				text: input.text,
				category: input.category,
				tags: input.tags,
				isActive: input.isActive ?? true,
			});
			return newPrompt;
		}),
});
