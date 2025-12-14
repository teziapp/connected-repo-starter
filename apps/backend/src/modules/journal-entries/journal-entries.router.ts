import { db } from "@backend/db/db";
import { protectedProcedure } from "@backend/procedures/protected.procedure";
import {
	journalEntryCreateInputZod,
	journalEntryDeleteZod,
	journalEntryGetByIdZod,
	journalEntryGetByUserZod,
} from "@connected-repo/zod-schemas/journal_entry.zod";

// Get all journal entries for the authenticated user
export const getAll = protectedProcedure.handler(async ({ context: { user } }) => {

	const journalEntries = await db.journalEntries
		.select("*", {
			author: (t) => t.author.selectAll(),
		})
		.where({ authorUserId: user.id });

	return journalEntries;
});

// Get journal entry by ID
export const getById = protectedProcedure
	.input(journalEntryGetByIdZod)
	.handler(async ({ input: { journalEntryId }, context: { user } }) => {

		const journalEntry = await db.journalEntries
			.find(journalEntryId)
			.where({ authorUserId: user.id });

		return journalEntry;
	});

// Create journal entry
export const create = protectedProcedure
	.input(journalEntryCreateInputZod)
	.handler(async ({ input, context: { user } }) => {

		const newJournalEntry = await db.journalEntries.create({
			...input,
			authorUserId: user.id,
		});

		return newJournalEntry;
	});

// Get journal entries by user
export const getByUser = protectedProcedure
	.input(journalEntryGetByUserZod)
	.handler(async ({ input }) => {
		const journalEntries = await db.journalEntries
			.select("*", {
				author: (t) => t.author.selectAll(),
			})
			.where({ authorUserId: input.authorUserId })
			.order({ createdAt: "DESC" });

		return journalEntries;
	});

// Delete journal entry
export const deleteEntry = protectedProcedure
	.input(journalEntryDeleteZod)
	.handler(async ({ input: { journalEntryId }, context: { user } }) => {
		await db.journalEntries.find(journalEntryId).where({ authorUserId: user.id }).delete();

		return { success: true };
	});

export const journalEntriesRouter = {
	getAll,
	getById,
	create,
	getByUser,
	delete: deleteEntry,
};
