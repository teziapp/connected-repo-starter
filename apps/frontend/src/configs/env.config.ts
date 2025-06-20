import { z } from "zod";

const envSchema = z.object({
	VITE_API_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(import.meta.env);
