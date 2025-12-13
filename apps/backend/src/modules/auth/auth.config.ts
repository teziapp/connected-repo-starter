import { betterAuth } from "better-auth";
import { orchidAdapter } from "./adapters/orchid-adapter";
import { db } from "@backend/db/db";
import { env } from "@backend/configs/env.config";

export const auth = betterAuth({
	database: orchidAdapter(db),
	baseURL: env.VITE_API_URL,
	trustedOrigins: [env.WEBAPP_URL],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	user: {
		changeEmail: {
			enabled: false, // Disable email changes for simplicity
		},
	},
});