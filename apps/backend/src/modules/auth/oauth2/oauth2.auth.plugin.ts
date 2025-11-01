
import type { FastifyInstance } from "fastify";
import { googleOAuth2Plugin } from "./google-oauth2.auth.plugin";

/**
 * Main OAuth2 Plugin
 * Registers all OAuth2 providers and their routes
 * Session middleware is imported and called by individual OAuth providers
 */
export async function oauth2Plugin(app: FastifyInstance) {
	// Register Google OAuth2 provider
	await app.register(googleOAuth2Plugin, {
		prefix: "/google"
	});

	// Future: Add more OAuth2 providers here (GitHub, Facebook, etc.)
	// await app.register(githubOAuth2Plugin);
	// await app.register(facebookOAuth2Plugin);
}
