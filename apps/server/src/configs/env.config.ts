import "dotenv/config";
import { z } from "zod/v4";

const NODE_ENV = z.enum(["development", "staging", "production", "test"]);
export type ENVIORNMENT = z.infer<typeof NODE_ENV>;

const envSchema = z.object({
	ALLOWED_ORIGINS: z.string().optional(),
	VITE_NODE_ENV: NODE_ENV,
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
export const isDev = env.VITE_NODE_ENV === "development";
export const isProd = env.VITE_NODE_ENV === "production";
export const isStaging = env.VITE_NODE_ENV === "staging";
export const isTest = env.VITE_NODE_ENV === "test";
