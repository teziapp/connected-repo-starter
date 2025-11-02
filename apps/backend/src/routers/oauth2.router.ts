
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { googleOAuth2Plugin } from "../modules/auth/oauth2/google-oauth2.auth.plugin";

/**
 * Main OAuth2 Plugin
 * Registers all OAuth2 providers and their routes
 * Session middleware is imported and called by individual OAuth providers
 *
 * IMPORTANT: OAuth2 routes have strict rate limiting to prevent:
 * - Brute force authorization attempts
 * - DoS attacks on callback endpoints
 * - OAuth provider abuse (could get app blacklisted)
 * - Cost (each callback may involve external API calls)
 */
export async function oauth2Router(app: FastifyInstance) {
	// Strict rate limiting for OAuth2 routes
	// 5 requests per 15 minutes per IP - prevents abuse while allowing legitimate retries
	await app.register(rateLimit, {
		max: 5,
		timeWindow: "15 minutes",
		errorResponseBuilder: () => ({
			statusCode: 429,
			error: "Too Many Requests",
			message: "Too many OAuth requests. Please try again in 15 minutes.",
		}),
	});

	// Register Google OAuth2 provider
	await app.register(googleOAuth2Plugin, {
		prefix: "/google"
	});

	// Future: Add more OAuth2 providers here (GitHub, Facebook, etc.)
	// await app.register(githubOAuth2Plugin);
	// await app.register(facebookOAuth2Plugin);
}
