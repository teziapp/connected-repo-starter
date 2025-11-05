/*
 * Webhook Processor Script
 *
 * This script processes pending webhooks from the webhook_call_queue table.
 * It handles retry logic with exponential backoff and logs successes/failures.
 *
 * Usage:
 * - Can be run as a standalone script via cron job
 * - Can be triggered via internal API endpoint
 * - Processes up to 50 webhooks per run
 */

import { logger } from "@backend/app";
import { processWebhookQueue } from "./utils/webhookQueue.utils";

/**
 * Main webhook processor function
 * Processes pending webhooks with retry logic and comprehensive logging
 */
export async function runWebhookProcessor(): Promise<{
	success: boolean;
	processed: number;
	succeeded: number;
	failed: number;
	retried: number;
	error?: string;
}> {
	const startTime = Date.now();

	try {
		logger.info("Starting webhook processor...");

		// Process webhook queue
		const results = await processWebhookQueue();

		const duration = Date.now() - startTime;

		// Log summary
		logger.info({
			duration,
			...results,
		}, "Webhook processor completed successfully");

		// Log details if webhooks were processed
		if (results.processed > 0) {
			logger.info(
				`Processed ${results.processed} webhooks: ${results.succeeded} succeeded, ${results.failed} failed, ${results.retried} retried`,
			);
		} else {
			logger.debug("No pending webhooks to process");
		}

		return {
			success: true,
			...results,
		};
	} catch (error) {
		const duration = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : "Unknown error";

		logger.error({
			error,
			duration,
		}, "Webhook processor failed with error");

		return {
			success: false,
			processed: 0,
			succeeded: 0,
			failed: 0,
			retried: 0,
			error: errorMessage,
		};
	}
}

/**
 * Standalone script execution
 * Run this file directly to process webhooks: node dist/modules/api-gateway/webhookProcessor.js
 */
if (require.main === module) {
	runWebhookProcessor()
		.then((result) => {
			if (result.success) {
				process.exit(0);
			} else {
				logger.error(`Webhook processor failed: ${result.error}`);
				process.exit(1);
			}
		})
		.catch((error) => {
			logger.error({ error }, "Fatal error in webhook processor");
			process.exit(1);
		});
}
