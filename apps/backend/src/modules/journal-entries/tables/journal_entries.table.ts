import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class JournalEntryTable extends BaseTable {
	readonly table = "journal_entries";

	columns = this.setColumns((t) => ({
		journalEntryId: t.ulid().primaryKey(),

		prompt: t.string(500).nullable(),
		promptId: t.smallint().foreignKey("prompts", "promptId", {
			onDelete: "SET NULL",
			onUpdate: "RESTRICT",
		}).nullable(),
		content: t.text(),
		authorUserId: t.uuid().foreignKey("users", "id", {
			onDelete: "CASCADE",
			onUpdate: "RESTRICT",
		}),

		...t.timestamps(),
	}));

	relations = {
		author: this.belongsTo(() => UserTable, {
			columns: ["authorUserId"],
			references: ["id"],
		})
	};
}
