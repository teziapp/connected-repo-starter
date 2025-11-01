import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/users/users.table";

export class PostTable extends BaseTable {
	readonly table = "posts";

	columns = this.setColumns((t) => ({
		postId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		title: t.string(),
		content: t.text(),
		authorUserId: t.uuid().foreignKey("users", "userId", {
			onDelete: "CASCADE",
			onUpdate: "RESTRICT"
		}),
		...t.timestamps(),
	}));

	relations = {
		author: this.belongsTo(() => UserTable, {
			columns: ["authorUserId"],
			references: ["userId"],
		}),
	};
}