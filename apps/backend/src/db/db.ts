import { dbConfig } from "@backend/db/config";
import { orchidORM } from "orchid-orm/node-postgres";

const databaseURL = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=${dbConfig.ssl ? "require" : "false"}`;

// Phase 1: Minimal database setup
// Tables will be added as modules are migrated in later phases
export const db = orchidORM(
	{
		databaseURL,
		// log: true,
	},
	{
		// Tables will be registered here as modules are migrated
		// Phase 2: sessions
		// Phase 3: users, journalEntries, prompts
		// Phase 5: teams, subscriptions, apiProductRequestLogs, webhookCallQueues
	},
);
