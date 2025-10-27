import { z } from "zod";
import { envSchemaZod } from "@frontend/utils/env_validator.zod.utils";

export type Env = z.infer<typeof envSchemaZod>;

export const env = envSchemaZod.parse(import.meta.env);
