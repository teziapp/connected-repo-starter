import type { FastifyReply, FastifyRequest } from "fastify";
import { RateLimiterMemory } from "rate-limiter-flexible";

// In-memory rate limiter for teams
// For production with multiple servers, consider using RateLimiterRedis
const teamRateLimiters = new Map<string, RateLimiterMemory>();

/**
 * Get or create a rate limiter for a team
 * @param teamId - Team UUID
 * @param rateLimit - Requests per minute
 * @returns RateLimiterMemory instance
 */
function getTeamRateLimiter(
	teamId: string,
	rateLimit: number,
): RateLimiterMemory {
	let limiter = teamRateLimiters.get(teamId);

	// Create new limiter if doesn't exist or rate limit changed
	if (!limiter || limiter.points !== rateLimit) {
		limiter = new RateLimiterMemory({
			points: rateLimit, // Number of requests
			duration: 60, // Per 60 seconds (1 minute)
			keyPrefix: `team_${teamId}`,
		});
		teamRateLimiters.set(teamId, limiter);
	}

	return limiter;
}

/**
 * Team Rate Limit Middleware
 * Uses rate-limiter-flexible with team ID as key
 * Checks team.rateLimitPerMinute field (requests per minute)
 * If null/undefined, skip rate limiting
 * Returns 429 Too Many Requests if exceeded
 */
export async function teamRateLimitHook(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Ensure team is attached by apiKeyAuthHook
	if (!request.team) {
		return reply.code(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "Authentication required",
		});
	}

	const { teamId, rateLimitPerMinute } = request.team;

	// Skip rate limiting if not configured
	if ( !rateLimitPerMinute ) {
		return; // No rate limit configured, proceed
	}

	try {
		// Get or create rate limiter for this team
		const limiter = getTeamRateLimiter(teamId, rateLimitPerMinute);

		// Consume 1 point
		await limiter.consume(teamId, 1);

		// If successful, proceed to next handler
	} catch (error) {
		// Rate limit exceeded
		if (error instanceof Error && "msBeforeNext" in error) {
			const msBeforeNext = (error as { msBeforeNext: number }).msBeforeNext;
			const retryAfter = Math.ceil(msBeforeNext / 1000);

			return reply
				.code(429)
				.header("Retry-After", retryAfter.toString())
				.send({
					statusCode: 429,
					error: "Too Many Requests",
					message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
					retryAfter,
				});
		}

		// Unknown error, re-throw
		throw error;
	}
}
