import { db } from "@backend/db/db";
import { publicProcedure } from "@backend/procedures/public.procedure";
import {
	promptGetActiveZod,
	promptGetByIdZod,
} from "@connected-repo/zod-schemas/prompt.zod";
import { ORPCError } from "@orpc/server";

// Get all active prompts
export const getAllActive = publicProcedure.handler(async () => {
	const prompts = await db.prompts
		.where({ isActive: true })
		.select("*")
		.order({ createdAt: "DESC" });

	return prompts;
});

// Get a random active prompt
export const getRandomActive = publicProcedure.handler(async () => {
	// Get count of active prompts
	const count = await db.prompts.count();

	if (count === 0) {
		throw new ORPCError("NOT_FOUND", {
			status: 404,
			message: "No active prompts available",
		});
	}

	// Try up to 3 times to get a random prompt
	for (let attempt = 0; attempt < 3; attempt++) {
		// Generate random offset between 0 and count-1
		const randomIndex = Math.floor(Math.random() * count);

		// Get the first active prompt at this offset
		const prompt = await db.prompts
			.where({ isActive: true, promptId: { gte: randomIndex } })
			.select("*")
			.limit(1)
			.take();

		if (prompt) {
			return prompt;
		}
	}

	// If all 3 attempts failed, throw error
	throw new ORPCError("NOT_FOUND", {
		status: 404,
		message: "Failed to retrieve a random active prompt after 3 attempts",
	});
});

// Get prompt by ID
export const getById = publicProcedure
	.input(promptGetByIdZod)
	.handler(async ({ input: { promptId } }) => {
		const prompt = await db.prompts.find(promptId);

		if (!prompt) {
			throw new ORPCError("NOT_FOUND", {
				status: 404,
				message: "Prompt not found",
			});
		}

		return prompt;
	});

// Get prompts by category (active/inactive)
export const getByCategory = publicProcedure
	.input(promptGetActiveZod)
	.handler(async ({ input }) => {
		const prompts = await db.prompts
			.where({ isActive: input.isActive })
			.select("*")
			.order({ createdAt: "DESC" });

		return prompts;
	});

export const promptsRouter = {
	getAllActive,
	getRandomActive,
	getById,
	getByCategory,
};
