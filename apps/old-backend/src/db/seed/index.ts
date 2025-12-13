import { seedPrompts } from "@backend/db/seed/prompts.seed";

export const seed = async () => {
	console.log("Seeding database...");

	// Seed prompts for journal entries
	await seedPrompts();

	console.log("Seeding completed successfully!");
};

