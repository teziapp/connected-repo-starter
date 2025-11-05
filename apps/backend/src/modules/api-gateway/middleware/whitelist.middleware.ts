import type { FastifyRequest, FastifyReply } from "fastify";
import { getClientIpAddress } from "@backend/utils/request-metadata.utils";
import {
	isDomainWhitelisted,
	isIPWhitelisted,
} from "@backend/modules/api-gateway/utils/ipChecker.utils";

/**
 * Domain/IP Whitelist Middleware
 * Checks request origin against team.allowedDomains (if not empty)
 * Checks request IP against team.allowedIPs (exact match, if not empty)
 */
export async function whitelistCheckHook(
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

	const { allowedDomains, allowedIPs } = request.team;

	// Check domain whitelist (if configured)
	if (allowedDomains && allowedDomains.length > 0) {
		const origin = request.headers.origin || request.headers.referer;

		if (!origin) {
			return reply.code(403).send({
				statusCode: 403,
				error: "Forbidden",
				message: "Request origin not provided",
			});
		}

		const isDomainAllowed = allowedDomains.some((whitelistEntry) =>
			isDomainWhitelisted(origin, whitelistEntry),
		);

		if (!isDomainAllowed) {
			return reply.code(403).send({
				statusCode: 403,
				error: "Forbidden",
				message: "Request origin not whitelisted",
			});
		}
	}

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
