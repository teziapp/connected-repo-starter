import { NODE_ENV_ZOD } from "@connected-repo/zod-schemas/node_env";
import { z } from "zod";

export const envSchemaZod = z.object({
	VITE_NODE_ENV: NODE_ENV_ZOD,
	VITE_API_URL: z.url("API URL must be a valid URL"),
});
