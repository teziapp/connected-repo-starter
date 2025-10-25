import { z } from "zod";

export const NODE_ENV_ZOD = z.enum(["development", "production", "staging", "test"]);
export type NODE_ENV = z.infer<typeof NODE_ENV_ZOD>;