import { createBaseTable } from "orchid-orm";
import { dbConfig } from "./config";

export const BaseTable = createBaseTable({
	databaseURL: `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=${dbConfig.ssl ? "require" : "false"}`,
	log: true,
	// Use snake_case for database columns (optional)
	snakeCase: true,
});