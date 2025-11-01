import { NODE_ENV_ZOD } from "@connected-repo/zod-schemas/node_env";
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	ALLOWED_ORIGINS: z.string().optional(),
	NODE_ENV: NODE_ENV_ZOD,
	DB_HOST: z.string().optional(),
	DB_PORT: z.string().optional(),
	DB_USER: z.string().optional(),
	DB_PASSWORD: z.string().optional(),
	DB_NAME: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().min(1).includes(".apps.googleusercontent.com"),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),
	WEBAPP_URL: z.url(),
	VITE_API_URL: z.url(),
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
