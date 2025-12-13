/**
 * Webhook Queue Utilities
 *
 * This module handles sending webhooks with Bearer token authentication.
 *
 * ## Webhook Authentication Guide for Consumers
 *
 * All outgoing webhooks include an `Authorization` header with a Bearer token:
 * - `Authorization: Bearer <your-token>`
 */

import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import type { SubscriptionAlertWebhookPayload } from "@connected-repo/zod-schemas/webhook_call_queue.zod";
import axios, { type AxiosError } from "axios";
import { WEBHOOK_BATCH_PROCESSING_LIMIT } from "../constants/apiGateway.constants";

/**
 * Send a webhook via HTTP POST using axios
 * @param url - The webhook URL
 * @param payload - The payload to send
 * @param bearerToken - The bearer token for authentication (optional)
 * @param timeoutMs - Request timeout in milliseconds (default: 3000)
 * @returns Response status and data
 */
export async function sendWebhook(
	url: string,
	payload: SubscriptionAlertWebhookPayload,
	bearerToken?: string,
	timeoutMs = 3000,
): Promise<{ success: boolean; status?: number; error?: string }> {
	try {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"User-Agent": "API-Gateway-Webhook/1.0",
		};

		// Add Authorization header if bearer token is provided
		if (bearerToken) {
			headers.Authorization = `Bearer ${bearerToken}`;
		}

		const response = await axios.post(url, payload, {
			headers,
			timeout: timeoutMs,
			validateStatus: (status) => status >= 200 && status < 300,
		});

		return {
			success: true,
			status: response.status,
		};
	} catch (error) {
		const axiosError = error as AxiosError;

		if (axiosError.response) {
			// Server responded with error status
			return {
				success: false,
				status: axiosError.response.status,
				error: `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
			};
		}

		if (axiosError.request) {
			// Request made but no response received
			return {
				success: false,
				error: axiosError.code === "ECONNABORTED"
					? "Request timeout"
					: "No response from server",
			};
		}

		// Error setting up the request
		return {
			success: false,
			error: axiosError.message || "Unknown error occurred",
		};
	}
}

/**
 * Calculate exponential backoff delay
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function calculateBackoff(attempt: number): number {
	// Exponential backoff: 2^attempt * 1000ms
	// Attempt 0: 1s, Attempt 1: 2s, Attempt 2: 4s
	return Math.pow(2, attempt) * 1000;
}

/**
 * Process all pending webhooks in the queue
 * Handles retry logic with exponential backoff
 */
export async function processWebhookQueue() {
	// Get pending webhooks that are ready to be processed
	const pendingWebhooks = await db.webhookCallQueues
		.where({
			status: "Pending",
			scheduledFor: { lt: sql`NOW()` },
			attempts: { lt: sql`"max_attempts"` }, //https://orchid-orm.netlify.app/guide/where.html#column-operators
		})
		.order({ scheduledFor: "ASC" })
		.limit(WEBHOOK_BATCH_PROCESSING_LIMIT); // Process in batches

	const results = {
		processed: 0,
		succeeded: 0,
		failed: 0,
		retried: 0,
	};

	for (const webhook of pendingWebhooks) {
		results.processed++;

		// Fetch team webhook bearer token (optional)
		const team = await db.teams
			.select("subscriptionAlertWebhookBearerToken")
			.find(webhook.teamId);

		// Send webhook with bearer token (if configured)
		const result = await sendWebhook(
			webhook.webhookUrl,
			webhook.payload as SubscriptionAlertWebhookPayload,
			team?.subscriptionAlertWebhookBearerToken || undefined,
		);

		// Increment attempt count
		const newAttempts = webhook.attempts + 1;

		if (result.success) {
			// Mark as sent
			await db.webhookCallQueues.find(webhook.webhookCallQueueId).update({
				status: "Sent",
				lastAttemptAt: () => sql`NOW()`,
				sentAt: () => sql`NOW()`,
				errorMessage: null,
			})
			.increment("attempts");
			results.succeeded++;
		} else {
			// Check if we should retry
			if (newAttempts < webhook.maxAttempts) {
				// Schedule retry with exponential backoff
				const backoffMs = calculateBackoff(newAttempts);
				await db.webhookCallQueues.find(webhook.webhookCallQueueId).update({
					lastAttemptAt: () => sql`NOW()`,
					scheduledFor: () => sql`NOW() + INTERVAL '${backoffMs} milliseconds'`,
					errorMessage: result.error || "Unknown error",
				})
				.increment("attempts");
				results.retried++;
			} else {
				// Max attempts reached, mark as failed
				await db.webhookCallQueues.find(webhook.webhookCallQueueId).update({
					status: "Failed",
					lastAttemptAt: () => sql`NOW()`,
					errorMessage: result.error || "Max retry attempts exceeded",
				})
				.increment("attempts");
				results.failed++;
			}
		}
	}

	return results;
}
