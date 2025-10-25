import z from "zod";

export const NODE_ENV_ZOD = z.enum(['development', 'production', "staging", 'test']);