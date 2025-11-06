import { db } from "@backend/db/db";
import { JournalEntryCreateInput, JournalEntrySelectAll } from "@connected-repo/zod-schemas/journal_entry.zod";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Save Journal Entry Handler
 *
 * This handler is called after all middleware (auth, whitelist, rate limit, subscription check, logging)
 * The request object will have team and subscription data attached by middleware
 *
 * @param request - Fastify request with team and subscription attached
 * @param reply - Fastify reply
 */
export async function saveJournalEntryHandler(
	request: FastifyRequest<{ Body: JournalEntryCreateInput }>,
	reply: FastifyReply,
): Promise<JournalEntrySelectAll> {
	// Middleware ensures team and subscription exist
	if (!request.team || !request.subscription) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Authentication required",
		});
	}

	const { prompt, promptId, content } = request.body;
	const { teamId } = request.team;
	const { teamUserReferenceId } = request.subscription;

	try {
		// Create journal entry in database
		const journalEntry = await db.journalEntries.create({
			authorUserId: teamUserReferenceId,
			promptId,
			prompt,
			content,
		});

		// Log success for debugging
		request.log.info({
			journalEntryId: journalEntry.journalEntryId,
			teamId,
			teamUserReferenceId,
			promptLength: prompt.length,
			contentLength: content.length,
		}, "Journal entry saved successfully");

		return reply.code(201).send(journalEntry);
	} catch (error) {
		request.log.error({
			error,
			teamId,
			teamUserReferenceId,
		}, "Failed to save journal entry");

		return reply.code(500).send({
			statusCode: 500,
			error: "Internal Server Error",
			message: "Failed to save journal entry",
		});
	}
}
