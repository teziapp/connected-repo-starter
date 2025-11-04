import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import type { ApiProductSku } from "@connected-repo/zod-schemas/enums.zod";
import { subscriptionAlertWebhookPayloadZod } from "@connected-repo/zod-schemas/webhook_call_queue.zod";

/**
 * Find an active subscription for a team and product
 * @param teamId - The team UUID
 * @param apiProductSku - The API product SKU
 * @returns Active subscription or null if not found
 */
export async function findActiveSubscription(
	teamId: string,
	apiProductSku: ApiProductSku,
) {
	const subscription = await db.subscriptions
		.where({
			teamId,
			apiProductSku,
			expiresAt: { gt: sql`NOW()` },
			requestsConsumed: { lt: sql`max_requests` },
		})
		.order({ createdAt: "DESC" })
		.takeOptional();

	return subscription;
}

/**
 * Atomically increment subscription usage and check for 90% threshold
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

	// Check if 90% threshold reached and webhook not already sent
	await checkAndQueueWebhookAt90Percent(updatedSubscription);

	return updatedSubscription;
}

/**
 * Check if subscription has reached 90% usage and queue webhook if needed
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
	// 1. Usage is >= 90%
	// 2. Notification hasn't been sent yet
	if (usagePercent >= 90 && !subscription.notifiedAt90PercentUse) {
		// Get team webhook URL
		const team = await db.teams.findBy({
			teamId: subscription.teamId,
		});

		if (!team?.subscriptionAlertWebhookUrl) {
			// No webhook URL configured, mark as notified to prevent repeated checks
			await db.subscriptions
				.find(subscription.subscriptionId)
				.update({
					notifiedAt90PercentUse: () => sql`NOW()`,
				});
			return;
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

		// Queue webhook
		await db.webhookCallQueues.create({
			teamId: subscription.teamId,
			subscriptionId: subscription.subscriptionId,
			webhookUrl: team.subscriptionAlertWebhookUrl,
			status: "Pending",
			attempts: 0,
			maxAttempts: 3,
			scheduledFor: () => sql`NOW()`,
			payload,
		});

		// Mark subscription as notified
		await db.subscriptions
			.find(subscription.subscriptionId)
			.update({
				notifiedAt90PercentUse: () => sql`NOW()`,
			});
	}
}
