import { env, isDev, isProd } from "@backend/configs/env.config";
import { db } from "@backend/db/db";
import { allowedOrigins } from "@backend/request_handlers/user_app.handler";
import { betterAuth } from "better-auth";
import { orchidAdapter } from "./orchid-adapter/factory.orchid_adapter";

export const auth = betterAuth({
	account: {
		modelName: "accounts",
	},
	advanced: {
		cookies: {
			state: {
				attributes: {
					sameSite: isProd ? "none" : "lax",
					secure: isDev ? false : true,
				}
			}
		},
		database: {
			// Setting generateId to false allows your database handle all ID generation
			generateId: false,
		},
		...(isProd && {
      crossSubDomainCookies: {
        enabled: true,
        domain: env.WEBAPP_URL.replace(/^https?:\/\//, '').split(':')[0], // Extract domain without protocol and port
      },
    }),
	},
	baseURL: env.VITE_API_URL,
	basePath: "/api/auth",
	database: orchidAdapter(db),
	// Increase timeout for OAuth token exchange
	defaultCookieAttributes: {
		httpOnly: true,
		secure: isProd,
		path: "/",
	},
	emailAndPassword: {
		enabled: false,
	},
	secret: env.BETTER_AUTH_SECRET,
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
		modelName: "sessions",
		additionalFields: {
			browser: {
				type: "string",
				required: false,
				input: false,
			},
			os: {
				type: "string",
				required: false,
				input: false,
			},
			device: {
				type: "string",
				required: false,
				input: false,
			},
			deviceFingerprint: {
				type: "string",
				required: false,
				input: false,
			},
			markedInvalidAt: {
				type: "date",
				required: false,
				defaultValue: null,
				input: false, // Don't allow user input for soft delete timestamp
			},
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	trustedOrigins: allowedOrigins,
	user: {
		changeEmail: {
			enabled: false, // Disable email changes for simplicity
		},
		modelName: "users",
	},
	verification: {
		modelName: "verifications",
	},
	experimental: {
		joins: true,
	}
});