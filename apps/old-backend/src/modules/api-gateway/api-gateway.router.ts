/**
 * @example Adding new OpenAPI routes:
 *
 * // 1. Create Zod schema in packages/zod-schemas/src/
 * export const userResponseZod = z.object({
 *   userId: z.uuid().meta({ description: "User ID" }),
 *   name: z.string().meta({ description: "User name", example: "John Doe" }),
 * });
 *
 * // 2. Import and use in router with .withTypeProvider()
 * app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
 *   method: "GET",
 *   url: "/users/:id",
 *   schema: {
 *     params: z.object({ id: z.uuid() }),
 *     response: {
 *       200: userResponseZod,
 *     },
 *   } satisfies FastifyZodOpenApiSchema,
 *   handler: async (req, reply) => {
 *     // Your handler logic
 *   },
 * });
 */

import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { saveJournalEntryHandler } from "@backend/modules/api-gateway/handlers/save_journal_entry.handler";
import {
	apiKeyAuthHook,
	corsValidationHook,
	ipWhitelistCheckHook,
	requestLoggerHooks,
	subscriptionCheckHook,
	teamRateLimitHook
} from "@backend/modules/api-gateway/middleware";
import { apiProductRequestLogSelectAllZod } from "@connected-repo/zod-schemas/api_request_log.zod";
import { apiProductRequestStatusZod } from "@connected-repo/zod-schemas/enums.zod";
import {
	journalEntryCreateInputZod,
	journalEntrySelectAllZod
} from "@connected-repo/zod-schemas/journal_entry.zod";
import {
	SubscriptionSelectAll,
	subscriptionSelectAllZod
} from "@connected-repo/zod-schemas/subscription.zod";
import { TeamSelectAll } from "@connected-repo/zod-schemas/team.zod";
import { zString, zTimeEpoch } from "@connected-repo/zod-schemas/zod_utils";
import type { FastifyInstance } from "fastify";
import { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import z from "zod";

declare module "fastify" {
	interface FastifyRequest {
		team?: Omit<TeamSelectAll, "apiSecretHash">;
		subscription?: SubscriptionSelectAll;
		requestStartTime?: number;
	}
}

// API Key header schema for OpenAPI documentation
const apiKeyHeaderZod = z.object({
	"x-api-key": zString.describe("API key for authentication"),
	"x-team-id": z.uuid().describe("Team ID"),
});

// Generic error response schema
const errorResponseZod = z.object({
	statusCode: z.number(),
	error: z.string(),
	message: z.string(),
});

// ============================================================
// API Routes
// ============================================================
// All routes defined below will automatically appear in OpenAPI spec
// Use .withTypeProvider<FastifyZodOpenApiTypeProvider>() for type safety
export const apiGatewayRouter = async (app: FastifyInstance) => {
	// Handle OPTIONS preflight requests BEFORE auth chain
	app.addHook("preHandler", corsValidationHook);
	app.addHook("preHandler", apiKeyAuthHook);
	app.addHook("preHandler", ipWhitelistCheckHook);
	app.addHook("preHandler", teamRateLimitHook);
	/**
	 * POST /api/v1/journal_entry_create
	 * Save a journal entry with full middleware chain
	 */
	app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
		method: "POST",
		url: "/v1/journal_entry/create",
		schema: {
			description: "Save a journal entry",
			tags: ["Product API"],
			headers: apiKeyHeaderZod,
			body: journalEntryCreateInputZod,
			response: {
				201: journalEntrySelectAllZod,
				401: errorResponseZod,
				403: errorResponseZod,
				402: errorResponseZod,
				429: errorResponseZod,
				500: errorResponseZod,
			},
			querystring: z.object({
				teamUserReferenceId: z.string(),
			})
		} satisfies FastifyZodOpenApiSchema,
		preHandler: [subscriptionCheckHook("journal_entry_create")],
		onRequest: requestLoggerHooks.onRequest,
		onResponse: requestLoggerHooks.onResponse,
		handler: saveJournalEntryHandler,
	});

	/**
	 * GET /api/v1/logs/:requestId
	 * Get a specific API request log by ID
	 */
	app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
		method: "GET",
		url: "/v1/logs/:requestId",
		schema: {
			description: "Get specific API request log by ID",
			tags: ["Management API"],
			headers: apiKeyHeaderZod,
			params: z.object({
				requestId: z.string(),
			}),
			response: {
				200: apiProductRequestLogSelectAllZod,
				401: errorResponseZod,
				404: errorResponseZod,
			},
		} satisfies FastifyZodOpenApiSchema,
		handler: async (request, reply) => {
			const { requestId } = request.params;
			const teamId = request.team?.teamId;

			if (!teamId) {
				return reply.code(401).send({
					statusCode: 401,
					error: "Unauthorized",
					message: "Authentication required",
				});
			}

			// Get log by ID and verify it belongs to the team
			const log = await db.apiProductRequestLogs.find(requestId)
				.where({ teamId });

			if (!log) {
				return reply.code(404).send({
					statusCode: 404,
					error: "Not Found",
					message: "Log not found or does not belong to your team",
				});
			}

			return reply.code(200).send(log);
		},
	});

	/**
	 * GET /api/v1/logs
	 * Get paginated API request logs for team with optional filters
	 */
	app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
		method: "GET",
		url: "/v1/logs",
		schema: {
			description:
				"Get paginated API request logs for team with optional filters",
			tags: ["Management API"],
			headers: apiKeyHeaderZod,
			querystring: z.object({
				page: z.coerce.number().int().min(1).default(1),
				limit: z.coerce.number().int().min(1).max(100).default(20),
				status: apiProductRequestStatusZod.optional(),
				startDate: zTimeEpoch.optional(),
				endDate: zTimeEpoch.optional(),
			}),
			response: {
				200: z.object({
					logs: z.array(apiProductRequestLogSelectAllZod), // Will be apiProductRequestLogSelectAllZod
					total: z.number(),
					page: z.number(),
					limit: z.number(),
					totalPages: z.number(),
				}),
				401: errorResponseZod,
			},
		} satisfies FastifyZodOpenApiSchema,
		handler: async (request, reply) => {
			const teamId = request.team?.teamId;

			if (!teamId) {
				return reply.code(401).send({
					statusCode: 401,
					error: "Unauthorized",
					message: "Authentication required",
				});
			}

			const {
				page = 1,
				limit = 20,
				status,
				startDate,
				endDate,
			} = request.query;

			// Build query with filters
			let query = db.apiProductRequestLogs.where({ teamId });

			if (status) {
				query = query.where({ status: status });
			}

			if (startDate) {
				query = query.where({ createdAt: { gt: sql`to_timestamp(${startDate})` } });
			}

			if (endDate) {
				query = query.where({ createdAt: { lt: sql`to_timestamp(${endDate})` } });
			}

			// Get total count for pagination
			const total = await query.count();

			// Get paginated logs
			const logs = await query
				.order({ createdAt: "DESC" })
				.limit(limit)
				.offset((page - 1) * limit);

			const totalPages = Math.ceil(total / limit);

			return reply.code(200).send({
				logs,
				total,
				page,
				limit,
				totalPages,
			});
		},
	});

	/**
	 * GET /api/v1/subscriptions/active
	 * Get active subscriptions for team with optional product filter
	 */
	app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
		method: "GET",
		url: "/v1/journal_entry/subscriptions/active",
		schema: {
			description:
				"Get active subscriptions for team with optional product filter",
			tags: ["Management API"],
			headers: apiKeyHeaderZod,
			querystring: z.object({
				teamUserReferenceId: z.string(),
			}),
			response: {
				200: z.array(subscriptionSelectAllZod),
				401: errorResponseZod,
			},
		} satisfies FastifyZodOpenApiSchema,
		handler: async (request, reply) => {
			const teamId = request.team?.teamId;

			if (!teamId) {
				return reply.code(401).send({
					statusCode: 401,
					error: "Unauthorized",
					message: "Authentication required",
				});
			}

			const { teamUserReferenceId } = request.query;

			// Build query
			const subscriptions = await db.subscriptions
				.where({ teamId, teamUserReferenceId, apiProductSku: "journal_entry_create" })
				.where({ expiresAt: { gt: sql`NOW()` } })
				.order({ createdAt: "DESC" });

			return reply.code(200).send(subscriptions);
		},
	});
};
