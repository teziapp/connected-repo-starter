import { z } from "zod";
import { NODE_ENV_ZOD } from "../../../../packages/zod-schemas/dist/node_env";

export const envSchemaZod = z.object({
	VITE_NODE_ENV: NODE_ENV_ZOD,
	VITE_API_URL: z.url("API URL must be a valid URL"),
});
