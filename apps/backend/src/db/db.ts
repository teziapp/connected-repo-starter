import { dbConfig } from "@backend/db/config";
import { PostTable } from "@backend/db/tables/post.table";
import { UserTable } from "@backend/db/tables/user.table";
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
	},
);
