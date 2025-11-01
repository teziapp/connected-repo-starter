import { dbConfig } from "@backend/db/config";
import { SessionTable } from "@backend/modules/auth/tables/session.auth.table";
import { PostTable } from "@backend/modules/posts/tables/posts.table";
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
	},
);
