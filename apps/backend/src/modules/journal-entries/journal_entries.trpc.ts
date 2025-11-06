import { db } from "@backend/db/db";
import { protectedProcedure, trpcRouter } from "@backend/trpc";
import {
	journalEntryCreateInputZod,
	journalEntryDeleteZod,
	journalEntryGetByIdZod,
	journalEntryGetByUserZod,
} from "@connected-repo/zod-schemas/journal_entry.zod";

export const journalEntriesRouterTrpc = trpcRouter({
	// Get all journal entries for a team
	getAll: protectedProcedure.query(async () => {
		const journalEntries = await db.journalEntries.select("*", {
			author: (t) => t.author.selectAll()
		});
		return journalEntries;
	}),

	// Get journal entry by ID
	getById: protectedProcedure
		.input(journalEntryGetByIdZod)
		.query(async ({ input: { journalEntryId } }) => {
			const journalEntry = await db.journalEntries.find(journalEntryId);

			if (!journalEntry) {
				throw new Error("Journal entry not found");
			}

			return journalEntry;
		}),

	// Create journal entry
	create: protectedProcedure
		.input(journalEntryCreateInputZod)
		.mutation(async ({ input, ctx: { user } }) => {
			const newJournalEntry = await db.journalEntries.create({
				authorUserId: user.userId,
				prompt: input.prompt,
				content: input.content,
			});
			return newJournalEntry;
		}),

	// Get journal entries by user
	getByUser: protectedProcedure
		.input(journalEntryGetByUserZod)
		.query(async ({ input }) => {
			const journalEntries = await db.journalEntries
				.select("*", {
					author: (t) => t.author.selectAll()
				})
				.where({ authorUserId: input.authorUserId })
				.order({ createdAt: "DESC" });

			return journalEntries;
		}),

	// Delete journal entry
	delete: protectedProcedure
		.input(journalEntryDeleteZod)
		.mutation(async ({ input: { journalEntryId } }) => {
			const journalEntry = await db.journalEntries.find(journalEntryId);

			if (!journalEntry) {
				throw new Error("Journal entry not found");
			}

			await db.journalEntries.find(journalEntryId).delete();

			return { success: true };
		}),
});
