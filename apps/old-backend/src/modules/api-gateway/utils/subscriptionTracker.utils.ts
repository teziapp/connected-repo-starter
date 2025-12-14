import { logger } from "@backend/app";
import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import type { ApiProductSku } from "@connected-repo/zod-schemas/enums.zod";
import { subscriptionAlertWebhookPayloadZod } from "@connected-repo/zod-schemas/webhook_call_queue.zod";
import {
	SUBSCRIPTION_USAGE_ALERT_THRESHOLD_PERCENT,
	WEBHOOK_MAX_RETRY_ATTEMPTS,
} from "../constants/apiGateway.constants";

/**
 * Find an active subscription for a team and product
 * @param teamId - The team UUID
 * @param apiProductSku - The API product SKU
 * @returns Active subscription or null if not found
 */
export async function findActiveSubscription(
	teamId: string,
	teamUserReferenceId: string,
	apiProductSku: ApiProductSku,
) {
	const subscription = await db.subscriptions
		.where({
			teamId,
			teamUserReferenceId,
			apiProductSku,
			expiresAt: { gt: sql`NOW()` },
			requestsConsumed: { lt: sql`"max_requests"` },
		})
		.order({ createdAt: "DESC" })
		.takeOptional();

	return subscription;
}

/**
 * Atomically increment subscription usage and check for usage threshold
 * @param subscriptionId - The subscription ID
 * @returns Updated subscription with new usage count
 */
export async function incrementSubscriptionUsage(subscriptionId: string) {
	// Atomically increment requestsConsumed
	const updatedSubscription = await db.subscriptions
		.selectAll()
		.find(subscriptionId)
		.increment("requestsConsumed");

	if (!updatedSubscription) {
		throw new Error(`Subscription ${subscriptionId} not found`);
	}

	// Check if usage threshold reached and webhook not already sent
	await checkAndQueueWebhookAt90Percent(updatedSubscription)
		.catch(error => {
			// Not throwing error as it might fail due to race-conditions in marking notified.
			logger.error("Error checking and queueing webhook at 90% usage:", error);
		});

	return updatedSubscription;
}

/**
 * Check if subscription has reached usage threshold and queue webhook if needed
 * @param subscription - The subscription object
 */
export async function checkAndQueueWebhookAt90Percent(subscription: {
	subscriptionId: string;
	teamId: string;
	requestsConsumed: number;
	maxRequests: number;
	notifiedAt90PercentUse: number | null;
	apiProductSku: ApiProductSku;
}) {
	const usagePercent = (subscription.requestsConsumed / subscription.maxRequests) * 100;

	// Only queue if:
	// 1. Usage is >= threshold percentage
	// 2. Notification hasn't been sent yet
	if (
		usagePercent >= SUBSCRIPTION_USAGE_ALERT_THRESHOLD_PERCENT &&
		!subscription.notifiedAt90PercentUse
	) {
		// Get team webhook URL
		const team = await db.teams.findBy({
			teamId: subscription.teamId,
		});

		if (!team?.subscriptionAlertWebhookUrl) {
			// No webhook URL configured, mark as notified to prevent repeated checks
			return db.subscriptions
				.find(subscription.subscriptionId)
				.update({
					notifiedAt90PercentUse: () => sql`NOW()`,
				});
		}

		const payload = subscriptionAlertWebhookPayloadZod.parse({
				event: "subscription.usage_alert",
				subscriptionId: subscription.subscriptionId,
				teamId: subscription.teamId,
				apiProductSku: subscription.apiProductSku,
				requestsConsumed: subscription.requestsConsumed,
				maxRequests: subscription.maxRequests,
				usagePercent: Math.round(usagePercent),
				timestamp: Date.now(),
			})

		return db.$transaction(async () => {
			// Queue webhook
			const createWebhook = db.webhookCallQueues.create({
				teamId: subscription.teamId,
				subscriptionId: subscription.subscriptionId,
				webhookUrl: team.subscriptionAlertWebhookUrl,
				status: "Pending",
				attempts: 0,
				maxAttempts: WEBHOOK_MAX_RETRY_ATTEMPTS,
				scheduledFor: () => sql`NOW()`,
				payload,
			});

			// Mark subscription as notified
			const markNotified = db.subscriptions
				.find(subscription.subscriptionId)
				.where({ notifiedAt90PercentUse: null })
				.update({
					notifiedAt90PercentUse: () => sql`NOW()`,
				});

			return await Promise.all([createWebhook, markNotified]);
		})
	}
}
