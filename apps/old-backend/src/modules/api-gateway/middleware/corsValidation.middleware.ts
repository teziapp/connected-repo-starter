import { db } from "@backend/db/db";
import { isDomainWhitelisted } from "@backend/modules/api-gateway/utils/ipChecker.utils";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Preflight OPTIONS Request Handler
 *
 * Handles CORS preflight OPTIONS requests BEFORE the auth chain.
 * This avoids unnecessary API key verification for preflight requests.
 *
 * Flow:
 * 1. Check if request is OPTIONS method
 * 2. Extract x-team-id header (lightweight lookup)
 * 3. Validate origin against team's allowedDomains
 * 4. Set CORS headers and return 204
 *
 * Note: Does NOT verify API key to keep preflight fast.
 * Actual requests still go through full apiKeyAuthHook.
 */
export async function corsValidationHook(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Only handle OPTIONS requests
	if (request.method !== "OPTIONS") {
		return;
	}

	// Extract team ID for lightweight lookup
	const teamId = request.headers["x-team-id"];

	if (!teamId || typeof teamId !== "string") {
		// No team ID - reject preflight
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Missing or invalid x-team-id header",
		});
	}

	// Lightweight team lookup - only fetch allowedDomains
	const team = await db.teams
		.select("allowedDomains")
		.findBy({ teamId });

	if (!team) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Invalid team ID",
		});
	}

	const { allowedDomains } = team;

	// Extract origin from headers
	const origin = request.headers.origin;

	// If no allowedDomains configured, allow preflight
	// (rely on global CORS from server.ts)
	if (!allowedDomains || allowedDomains.length === 0 || !origin) {
		reply.header("Access-Control-Allow-Origin", "*");
		reply.header("Access-Control-Allow-Credentials", "true");
		reply.header(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);
		reply.header(
			"Access-Control-Allow-Headers",
			"Content-Type, x-api-key, x-team-id, Authorization",
		);
		reply.header("Access-Control-Max-Age", "604800"); // 7 days
		return reply.code(204).send();
	}

	// Check if origin matches any allowed domain
	const isOriginAllowed = allowedDomains.some((whitelistEntry) =>
		isDomainWhitelisted(origin, whitelistEntry),
	);

	if (!isOriginAllowed) {
		return reply.code(403).send({
			statusCode: 403,
			error: "Forbidden",
			message: "Origin not allowed by CORS policy",
		});
	}

	// Set CORS headers for allowed origin
	reply.header("Access-Control-Allow-Origin", origin);
	reply.header("Access-Control-Allow-Credentials", "true");
	reply.header(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	reply.header(
		"Access-Control-Allow-Headers",
		"Content-Type, x-api-key, x-team-id, Authorization",
	);
	reply.header("Access-Control-Max-Age", "604800"); // 7 days

	return reply.code(204).send();
}
