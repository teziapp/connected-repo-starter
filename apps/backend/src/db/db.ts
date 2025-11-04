import { dbConfig } from "@backend/db/config";
import { SessionTable } from "@backend/modules/auth/tables/session.auth.table";
import { ApiProductRequestLogsTable } from "@backend/modules/logs/tables/api_product_request_logs.table";
import { PostTable } from "@backend/modules/posts/tables/posts.table";
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
		user: UserTable,
		post: PostTable,
		session: SessionTable,
		subscriptions: SubscriptionsTable,
		teams: TeamTable,
		apiProductRequestLogs: ApiProductRequestLogsTable,
		webhookCallQueues: WebhookCallQueueTable
	},
);
