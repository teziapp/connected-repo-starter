/**
 * API Gateway Middleware Exports
 *
 * This module provides all middleware hooks for the API Gateway system.
 *
 * Middleware chain order (typical usage):
 * 1. apiKeyAuthHook - Authenticates request via API key
 * 2. corsValidationHook - Validates CORS origin against team allowedDomains
 * 3. whitelistCheckHook - Validates domain/IP whitelist
 * 4. teamRateLimitHook - Enforces team rate limits
 * 5. subscriptionCheckHook(productSku) - Validates subscription
 * 6. requestLoggerHooks - Logs request/response
 *
 * @example
 * ```typescript
 * import {
 *   apiKeyAuthHook,
 *   corsValidationHook,
 *   whitelistCheckHook,
 *   teamRateLimitHook,
 *   subscriptionCheckHook,
 *   requestLoggerHooks,
 * } from '@backend/modules/api-gateway/middleware';
 *
 * fastify.post('/api/v1/journal_entry_create', {
 *   preHandler: [
 *     apiKeyAuthHook,
 *     corsValidationHook,
 *     whitelistCheckHook,
 *     teamRateLimitHook,
 *     subscriptionCheckHook('journal_entry_create'),
 *   ],
 *   onRequest: requestLoggerHooks.onRequest,
 *   onResponse: requestLoggerHooks.onResponse,
 * }, handler);
 * ```
 */

export { apiKeyAuthHook } from "./apiKeyAuth.middleware";
export { corsValidationHook } from "./corsValidation.middleware";
export {
  requestLoggerHooks, requestLoggerOnRequest,
  requestLoggerOnResponse
} from "./requestLogger.middleware";
export { subscriptionCheckHook } from "./subscriptionCheck.middleware";
export { teamRateLimitHook } from "./teamRateLimit.middleware";
export { whitelistCheckHook } from "./whitelist.middleware";

