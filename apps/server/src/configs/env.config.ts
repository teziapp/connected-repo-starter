import "dotenv/config";
import { z } from "zod/v4";

const NODE_ENV = z.enum(["development", "staging", "production", "test"]);
export type ENVIORNMENT = z.infer<typeof NODE_ENV>;

const envSchema = z.object({
	ALLOWED_ORIGINS: z.string().optional(),
	NODE_ENV: NODE_ENV,
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
