import { dbConfig } from "@backend/db/config";
import { SessionTable } from "@backend/modules/auth/tables/session.auth.table";
import { JournalEntryTable } from "@backend/modules/journal-entries/tables/journal_entries.table";
import { PromptTable } from "@backend/modules/journal-entries/tables/prompts.table";
import { ApiProductRequestLogsTable } from "@backend/modules/logs/tables/api_product_request_logs.table";
import { SubscriptionsTable } from "@backend/modules/subscriptions/tables/subscriptions.table";
import { WebhookCallQueueTable } from "@backend/modules/subscriptions/tables/webhookCallQueue.table";
import { TeamTable } from "@backend/modules/teams/tables/teams.table";
import { UserTable } from "@backend/modules/users/users/users.table";
import { orchidORM } from "orchid-orm/node-postgres";

const databaseURL = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=${dbConfig.ssl ? "require" : "false"}`;

export const db = orchidORM(
	{
		databaseURL,
		// log: true,
	},
	{
		users: UserTable,
		prompts: PromptTable,
		journalEntries: JournalEntryTable,
		sessions: SessionTable,
		subscriptions: SubscriptionsTable,
		teams: TeamTable,
		apiProductRequestLogs: ApiProductRequestLogsTable,
		webhookCallQueues: WebhookCallQueueTable
	},
);
