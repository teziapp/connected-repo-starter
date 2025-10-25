import { z } from "zod";

const NODE_ENV_ENUM_ZOD = z.enum(["development", "staging", "production", "test"]);

export const envSchemaZod = z.object({
  VITE_NODE_ENV: NODE_ENV_ENUM_ZOD,
  VITE_API_URL: z.url("API URL must be a valid URL"),
});