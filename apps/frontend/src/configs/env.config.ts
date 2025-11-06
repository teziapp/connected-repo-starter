import { envSchemaZod } from "@frontend/utils/env_validator.zod.utils";
import z from "zod";

export type Env = z.infer<typeof envSchemaZod>;

export const env = envSchemaZod.parse(import.meta.env);
