import { NODE_ENV_ZOD } from "@connected-repo/zod-schemas/node_env";
import { object, url } from "zod";

export const envSchemaZod = object({
	VITE_NODE_ENV: NODE_ENV_ZOD,
	VITE_API_URL: url("API URL must be a valid URL"),
});
