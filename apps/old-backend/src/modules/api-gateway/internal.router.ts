/**
 * Internal API Router
 *
 * Provides internal endpoints for system operations like webhook processing.
 * All endpoints are protected with INTERNAL_API_SECRET authentication.
 *
 * These endpoints should NOT be exposed publicly and should only be called by:
 * - Cron jobs
 * - Internal services
 * - System administrators
 */

import { env } from "@backend/configs/env.config";
import { logger } from "@backend/app";
import { runWebhookProcessor } from "@backend/modules/api-gateway/webhookProcessor";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

/**
 * Internal API Authentication Hook
 * Validates the Authorization header contains the correct Bearer token
 */
async function internalAuthHook(request: FastifyRequest, reply: FastifyReply) {
	// Check if INTERNAL_API_SECRET is configured
	if (!env.INTERNAL_API_SECRET) {
		logger.warn("INTERNAL_API_SECRET not configured - internal endpoints are disabled");
		return reply.code(503).send({
			statusCode: 503,
			error: "Service Unavailable",
			message: "Internal API is not configured",
		});
	}

	const authHeader = request.headers.authorization;

	// Check if Authorization header exists
	if (!authHeader) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Authorization header required",
		});
	}

	// Check if it's a Bearer token
	if (!authHeader.startsWith("Bearer ")) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Invalid authorization format. Expected: Bearer <token>",
		});
	}

	// Extract and validate token
	const token = authHeader.substring(7); // Remove "Bearer " prefix

	if (token !== env.INTERNAL_API_SECRET) {
		logger.warn({ ip: request.ip }, "Invalid internal API token attempt");
		return reply.code(403).send({
			statusCode: 403,
			error: "Forbidden",
			message: "Invalid authorization token",
		});
	}

	// Token is valid - continue to handler
}

export const internalRouter = async (app: FastifyInstance) => {
	// Apply authentication hook to all internal routes
	app.addHook("preHandler", internalAuthHook);

	/**
	 * POST /internal/process-webhooks
	 * Manually trigger webhook processor
	 *
	 * This endpoint processes all pending webhooks in the queue.
	 * Typically called by a cron job, but can be triggered manually for testing.
	 *
	 * Authentication: Requires INTERNAL_API_SECRET in Authorization header
	 * Example: Authorization: Bearer <INTERNAL_API_SECRET>
	 */
	app.post("/process-webhooks", async (_request, reply) => {
		try {
			logger.info("Manual webhook processing triggered via internal API");

			// Run webhook processor
			const result = await runWebhookProcessor();

			if (result.success) {
				return reply.code(200).send(result);
			}

			// Processor reported failure
			return reply.code(500).send({
				...result,
				statusCode: 500,
				error: "Internal Server Error",
				message: result.error || "Webhook processing failed",
			});
		} catch (error) {
			logger.error({ error }, "Unexpected error in webhook processor endpoint");

			return reply.code(500).send({
				statusCode: 500,
				error: "Internal Server Error",
				message: error instanceof Error ? error.message : "Unknown error occurred",
			});
		}
	});

	/**
	 * GET /internal/health
	 * Health check for internal API
	 */
	app.get("/health", async (_request, reply) => {
		return reply.code(200).send({
			status: "ok",
			message: "Internal API is operational",
		});
	});
};
