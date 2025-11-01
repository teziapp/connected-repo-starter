import { env } from "@backend/configs/env.config";
import { oauth2ErrorHandler, oauth2SuccessHandler } from "@backend/modules/auth/oauth2/oauth2_succes_error_handler.auth.utils";
import type { OAuth2Namespace } from "@fastify/oauth2";
import oauthPlugin from "@fastify/oauth2";
import type { FastifyInstance } from "fastify";

/**
 * Augment Fastify types to include Google-OAuth2 
 */
declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
	}
}


/**
 * Google OAuth2 Configuration
 */
export const GOOGLE_OAUTH2_CONFIG = {
	name: "googleOAuth2",
	credentials: {
		client: {
			id: env.GOOGLE_CLIENT_ID,
			secret: env.GOOGLE_CLIENT_SECRET,
		},
		auth: oauthPlugin.GOOGLE_CONFIGURATION,
	},
	scope: ["profile", "email"],
	startRedirectPath: "/auth/google",
	callbackUri: `${env.VITE_API_URL}/oauth2/google/callback`,
};

/**
 * Google OAuth2 user info response
 */
interface GoogleUserInfo {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

/**
 * Fetches user info from Google OAuth2
 */
async function fetchGoogleUserInfo(
	accessToken: string,
): Promise<GoogleUserInfo> {
	const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch user info from Google");
	}

	return response.json();
}

/**
 * Google OAuth2 Plugin
 * Registers Google OAuth2 and handles the callback
 */
export async function googleOAuth2Plugin(app: FastifyInstance ) {
	// Register Google OAuth2
	await app.register(oauthPlugin, GOOGLE_OAUTH2_CONFIG);

	// Register Google OAuth2 callback handler
	app.get("/callback", async (request, reply) => {
		try {
			// Get the access token from Google via the OAuth2 plugin
			const { token } =
				await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

			// Fetch user info from Google using the access token
			const userInfo = await fetchGoogleUserInfo(token.access_token);

			app.log.info({ userInfo }, "User authenticated via Google OAuth");

			// Use centralized session middleware to set session and redirect
			return oauth2SuccessHandler(request, reply, userInfo);
		} catch (error) {
			app.log.error({ error }, "OAuth callback error");
			// Use centralized error handler for consistent error handling
			return oauth2ErrorHandler(reply);
		}
	});
}
