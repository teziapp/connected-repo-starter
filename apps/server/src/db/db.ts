import { orchidORM } from "orchid-orm";
import { UserTable } from "./tables/user.table";
import { PostTable } from "./tables/post.table";

export const db = orchidORM(
	{
		user: UserTable,
		post: PostTable,
	},
	{
		log: true,
	},
);