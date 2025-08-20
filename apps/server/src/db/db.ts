import { orchidORM } from "orchid-orm";
import { dbConfig } from "./config";
import { UserTable } from "./tables/user.table";
import { PostTable } from "./tables/post.table";

const databaseURL = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=${dbConfig.ssl ? "require" : "false"}`;

export const db = orchidORM({
	databaseURL,
	log: true,
}, {
	user: UserTable,
	post: PostTable,
});