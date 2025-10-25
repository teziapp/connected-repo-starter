import { NODE_ENV_ZOD } from "@connected-repo/zod-schemas";
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
