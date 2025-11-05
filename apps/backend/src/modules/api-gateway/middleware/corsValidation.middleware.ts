import { isDomainWhitelisted } from "@backend/modules/api-gateway/utils/ipChecker.utils";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * CORS Validation Middleware for API Gateway
 *
 * Validates CORS origin against team's allowedDomains and sets appropriate CORS headers.
 * This middleware should run after apiKeyAuthHook to have access to request.team.
 *
 * Features:
 * - Validates origin against team.allowedDomains
 * - Sets CORS headers for allowed origins
 * - Handles preflight OPTIONS requests
 * - Rejects disallowed origins with 403
 */
export async function corsValidationHook(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Ensure team is attached by apiKeyAuthHook
	if (!request.team) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Authentication required",
		});
	}

	const { allowedDomains } = request.team;

	// If no allowedDomains configured, skip CORS validation
	// (rely on global CORS from server.ts)
	if (!allowedDomains || allowedDomains.length === 0) {
		return;
	}

	// Extract origin from headers
	const origin = request.headers.origin;

	// For non-browser requests (no origin header), allow through
	// (these are typically server-to-server calls)
	if (!origin) {
		return;
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

	// Handle preflight OPTIONS requests
	if (request.method === "OPTIONS") {
		reply.header("Access-Control-Max-Age", "86400"); // 24 hours
		return reply.code(204).send();
	}
}
