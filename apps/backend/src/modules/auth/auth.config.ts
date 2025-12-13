import { env, isDev, isProd } from "@backend/configs/env.config";
import { db } from "@backend/db/db";
import { betterAuth } from "better-auth";
import { orchidAdapter } from "./adapters/orchid-adapter";

export const auth = betterAuth({
	database: orchidAdapter(db),
	baseURL: env.VITE_API_URL,
	basePath: "/api/auth",
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.WEBAPP_URL],
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
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
		...(isProd && {
      crossSubDomainCookies: {
        enabled: true,
        domain: env.WEBAPP_URL.replace(/^https?:\/\//, '').split(':')[0], // Extract domain without protocol and port
      },
    }),
	},
	// Increase timeout for OAuth token exchange
	defaultCookieAttributes: {
		httpOnly: true,
		secure: isProd,
		path: "/",
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
		additionalFields: {
			email: {
				type: "string",
				required: false,
			},
			name: {
				type: "string",
				required: false,
			},
			displayPicture: {
				type: "string",
				required: false,
			},
			browser: {
				type: "string",
				required: false,
			},
			os: {
				type: "string",
				required: false,
			},
			device: {
				type: "string",
				required: false,
			},
			deviceFingerprint: {
				type: "string",
				required: false,
			},
			markedInvalidAt: {
				type: "date",
				required: false,
				input: false, // Don't allow user input for soft delete timestamp
			},
		},
	},
	user: {
		changeEmail: {
			enabled: false, // Disable email changes for simplicity
		},
	},
});