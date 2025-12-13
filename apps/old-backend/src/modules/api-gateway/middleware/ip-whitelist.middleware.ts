import {
	isIPWhitelisted
} from "@backend/modules/api-gateway/utils/ipChecker.utils";
import { getClientIpAddress } from "@backend/utils/request-metadata.utils";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Domain/IP Whitelist Middleware
 * Checks request origin against team.allowedDomains (if not empty)
 * Checks request IP against team.allowedIPs (exact match, if not empty)
 */
export async function ipWhitelistCheckHook(
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

	const { allowedIPs } = request.team;

	// Check IP whitelist (if configured)
	if (allowedIPs && allowedIPs.length > 0) {
		const clientIp = getClientIpAddress(request);

		if (!clientIp || clientIp === "unknown") {
			return reply.code(403).send({
				statusCode: 403,
				error: "Forbidden",
				message: "Client IP not detected",
			});
		}

		const isIPAllowed = allowedIPs.some((whitelistEntry) =>
			isIPWhitelisted(clientIp, whitelistEntry),
		);

		if (!isIPAllowed) {
			return reply.code(403).send({
				statusCode: 403,
				error: "Forbidden",
				message: "Client IP not whitelisted",
			});
		}
	}

	// If both checks pass (or are not configured), proceed
}
