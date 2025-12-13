import { NODE_ENV_ZOD } from "@connected-repo/zod-schemas/node_env";
import { zString } from "@connected-repo/zod-schemas/zod_utils";
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	ALLOWED_ORIGINS: zString.optional(),
	NODE_ENV: NODE_ENV_ZOD,
	DB_HOST: zString.optional(),
	DB_PORT: zString.optional(),
	DB_USER: zString.optional(),
	DB_PASSWORD: zString.optional(),
	DB_NAME: zString.optional(),
	GOOGLE_CLIENT_ID: zString.min(1).includes(".apps.googleusercontent.com"),
	GOOGLE_CLIENT_SECRET: zString.min(1),
	SESSION_SECRET: zString.min(32, "Session secret must be at least 32 characters"),
	WEBAPP_URL: z.url(),
	VITE_API_URL: z.url(),
	INTERNAL_API_SECRET: zString.min(32, "Internal API secret must be at least 32 characters").optional(),
	BETTER_AUTH_SECRET: zString.min(32, "Better Auth secret must be at least 32 characters"),
});

// ----------------------------------------
// Final Schema & Export
// ----------------------------------------
export const env = envSchema.parse(process.env);

// Environment helpers
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const isStaging = env.NODE_ENV === "staging";
export const isTest = env.NODE_ENV === "test";
