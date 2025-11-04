import { db } from "@backend/db/db";
import { verifyApiKey } from "@backend/modules/api-gateway/utils/apiKeyGenerator.utils";
import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * API Key Authentication Middleware
 * Extracts x-api-key and x-team-id headers, verifies API key against team's hash
 * and attaches team data to request object if valid
 */
export async function apiKeyAuthHook(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Extract headers
	const apiKey = request.headers["x-api-key"];
	const teamId = request.headers["x-team-id"];

	if (!apiKey || typeof apiKey !== "string") {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Missing or invalid x-api-key header",
		});
	}

	if (!teamId || typeof teamId !== "string") {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Missing or invalid x-team-id header",
		});
	}

	// Get team by ID with all columns including hidden ones
	const team = await db.teams
		.select("*", "apiSecretHash", "rateLimitPerMinute")
		.findBy({ teamId });

	if (!team) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Invalid team ID",
		});
	}

	// Verify API key against team's hash
	const isValid = await verifyApiKey(apiKey, team.apiSecretHash);

	if (!isValid) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Invalid API key",
		});
	}

	// Attach team to request object
	request.team = team;
}
