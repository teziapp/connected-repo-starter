import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/users/users.table";

export class JournalEntryTable extends BaseTable {
	readonly table = "journal_entries";

	columns = this.setColumns((t) => ({
		journalEntryId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),

		prompt: t.string(500).nullable(),
		promptId: t.smallint().foreignKey("prompts", "promptId", {
			onDelete: "RESTRICT",
			onUpdate: "RESTRICT",
		}).nullable(),
		content: t.text(),
		authorUserId: t.uuid().foreignKey("users", "userId", {
			onDelete: "CASCADE",
			onUpdate: "RESTRICT",
		}),

		...t.timestamps(),
	}));

	relations = {
		author: this.belongsTo(() => UserTable, {
			columns: ["authorUserId"],
			references: ["userId"],
		})
	};
}
