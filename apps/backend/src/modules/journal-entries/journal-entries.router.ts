import { db } from "@backend/db/db";
import { protectedProcedure } from "@backend/procedures/protected.procedure";
import {
	journalEntryCreateInputZod,
	journalEntryDeleteZod,
	journalEntryGetByIdZod,
	journalEntryGetByUserZod,
} from "@connected-repo/zod-schemas/journal_entry.zod";
import { ORPCError } from "@orpc/server";

// Get all journal entries for the authenticated user
export const getAll = protectedProcedure.handler(async ({ context: { user } }) => {
	if (!user?.id) {
		throw new ORPCError("UNAUTHORIZED", {
			status: 401,
			message: "User ID not found in session",
		});
	}

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
		if (!user?.id) {
			throw new ORPCError("UNAUTHORIZED", {
				status: 401,
				message: "User ID not found in session",
			});
		}

		const journalEntry = await db.journalEntries
			.find(journalEntryId)
			.where({ authorUserId: user.id });

		if (!journalEntry) {
			throw new ORPCError("NOT_FOUND", {
				status: 404,
				message: "Journal entry not found",
			});
		}

		return journalEntry;
	});

// Create journal entry
export const create = protectedProcedure
	.input(journalEntryCreateInputZod)
	.handler(async ({ input, context: { user } }) => {
		if (!user?.id) {
			throw new ORPCError("UNAUTHORIZED", {
				status: 401,
				message: "User ID not found in session",
			});
		}

		const newJournalEntry = await db.journalEntries.create({
			authorUserId: user.id,
			promptId: input.promptId,
			prompt: input.prompt,
			content: input.content,
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
		if (!user?.id) {
			throw new ORPCError("UNAUTHORIZED", {
				status: 401,
				message: "User ID not found in session",
			});
		}

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
