import { db } from "@backend/db/db";
import { incrementSubscriptionUsage } from "@backend/modules/api-gateway/utils/subscriptionTracker.utils";
import { getClientIpAddress } from "@backend/utils/request-metadata.utils";
import type { ApiRequestMethod } from "@connected-repo/zod-schemas/enums.zod";
import type { FastifyReply, FastifyRequest } from "fastify";

// Extend request to store start time and request data
interface RequestWithLogging extends FastifyRequest {
	_logData?: {
		startTime: number;
		requestBody: string | null;
		requestBodyJson: Record<string, unknown> | null;
	};
}

/**
 * Request Logger - onRequest Hook
 * Captures start time and request data
 */
export async function requestLoggerOnRequest(request: FastifyRequest) {
	const req = request as RequestWithLogging;

	// Capture start time
	req._logData = {
		startTime: Date.now(),
		requestBody: null,
		requestBodyJson: null,
	};

	// Capture request body if present
	if (request.body) {
		try {
			if (typeof request.body === "string") {
				req._logData.requestBody = request.body;
				req._logData.requestBodyJson = JSON.parse(
					request.body,
				) as Record<string, unknown>;
			} else if (typeof request.body === "object") {
				req._logData.requestBodyJson = request.body as Record<
					string,
					unknown
				>;
				req._logData.requestBody = JSON.stringify(request.body);
			}
		} catch {
			// If JSON parsing fails, just store as text
			req._logData.requestBody = String(request.body);
		}
	}
}

/**
 * Request Logger - onResponse Hook
 * Captures response data, calculates time, logs to database, increments usage
 */
export async function requestLoggerOnResponse(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const req = request as RequestWithLogging;

	// Skip logging if no log data (shouldn't happen)
	if (!req._logData) {
		return;
	}

	// Ensure team and subscription are attached
	if (!request.team || !request.subscription) {
		return;
	}

	// Calculate response time
	const endTime = Date.now();
	const responseTime = endTime - req._logData.startTime;

	// Get client IP
	const clientIp = getClientIpAddress(request);

	// Determine status based on HTTP status code
	let status: "Success" | "Server Error" | "AI Error" = "Success";
	if (reply.statusCode >= 500) {
		status = "Server Error";
	} else if (reply.statusCode >= 400) {
		status = "AI Error";
	}

	try {
		// Insert log into database
		await db.apiProductRequestLogs.create({
			teamId: request.team.teamId,
			teamUserReferenceId: request.subscription.teamUserReferenceId,
			method: request.method as ApiRequestMethod,
			path: request.url,
			ip: clientIp,
			status,
			requestBodyText: req._logData.requestBody,
			requestBodyJson: req._logData.requestBodyJson,
			responseText: "",
			responseJson: null,
			responseTime,
		});

		// Increment subscription usage
		await incrementSubscriptionUsage(request.subscription.subscriptionId);
	} catch (error) {
		// Log error but don't fail the request
		request.log.error(
			{ error, teamId: request.team.teamId },
			"Failed to log API request",
		);
	}
}

/**
 * Combined request logger hooks export
 * Use this object to register both hooks on a route
 */
export const requestLoggerHooks = {
	onRequest: requestLoggerOnRequest,
	onResponse: requestLoggerOnResponse,
};
