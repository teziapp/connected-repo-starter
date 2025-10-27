import { orchidORM } from "orchid-orm/node-postgres";
import { dbConfig } from "@server/db/config";
import { PostTable } from "@server/db/tables/post.table";
import { UserTable } from "@server/db/tables/user.table";

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
