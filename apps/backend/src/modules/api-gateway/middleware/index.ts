/**
 * API Gateway Middleware Exports
 *
 * This module provides all middleware hooks for the API Gateway system.
 *
 * Middleware chain order (typical usage):
 * 1. apiKeyAuthHook - Authenticates request via API key
 * 2. whitelistCheckHook - Validates domain/IP whitelist
 * 3. teamRateLimitHook - Enforces team rate limits
 * 4. subscriptionCheckHook(productSku) - Validates subscription
 * 5. requestLoggerHooks - Logs request/response
 *
 * @example
 * ```typescript
 * import {
 *   apiKeyAuthHook,
 *   whitelistCheckHook,
 *   teamRateLimitHook,
 *   subscriptionCheckHook,
 *   requestLoggerHooks,
 * } from '@backend/modules/api-gateway/middleware';
 *
 * fastify.post('/api/v1/save_journal_entry', {
 *   preHandler: [
 *     apiKeyAuthHook,
 *     whitelistCheckHook,
 *     teamRateLimitHook,
 *     subscriptionCheckHook('save_journal_entry'),
 *   ],
 *   onRequest: requestLoggerHooks.onRequest,
 *   onResponse: requestLoggerHooks.onResponse,
 * }, handler);
 * ```
 */

export { apiKeyAuthHook } from "./apiKeyAuth.middleware";
export { whitelistCheckHook } from "./whitelist.middleware";
export { teamRateLimitHook } from "./teamRateLimit.middleware";
export { subscriptionCheckHook } from "./subscriptionCheck.middleware";
export {
	requestLoggerOnRequest,
	requestLoggerOnResponse,
	requestLoggerHooks,
} from "./requestLogger.middleware";
