/**
 * API Gateway Constants
 *
 * This file contains configuration constants for the API gateway module,
 * including subscription tracking, webhook processing, and retry logic.
 */

/**
 * Subscription usage alert threshold percentage.
 * When subscription usage reaches this percentage, a webhook notification is triggered.
 */
export const SUBSCRIPTION_USAGE_ALERT_THRESHOLD_PERCENT = 90;

/**
 * Maximum number of retry attempts for webhook delivery.
 * After this many failed attempts, the webhook is marked as permanently failed.
 */
export const WEBHOOK_MAX_RETRY_ATTEMPTS = 3;

/**
 * Batch size for processing pending webhooks in a single queue processing run.
 * This limits the number of webhooks processed per execution to avoid overwhelming the system.
 */
export const WEBHOOK_BATCH_PROCESSING_LIMIT = 50;
