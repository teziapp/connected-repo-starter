import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/users/users.table";
import { ulid } from "ulid";

export class SessionTable extends BaseTable {
	readonly table = "session";

	columns = this.setColumns((t) => ({
		sessionId: t.uuid().primaryKey().default(() => ulid()),
		userId: t.string().nullable(),
		email: t.string(),
		name: t.string().nullable(),
		displayPicture: t.string().nullable(),
		ipAddress: t.string().nullable(),
		userAgent: t.text().nullable(),
		browser: t.string().nullable(),
		os: t.string().nullable(),
		device: t.string().nullable(),
		deviceFingerprint: t.string().nullable(),
		markedInvalidAt: t.timestamp().nullable(),
		expiresAt: t.timestamp(),
		...t.timestamps(),
	}),
	(t) => [
		t.index([
			"userId", 
			{ column: "expiresAt", order: "DESC" }, 
			{ column: "markedInvalidAt", order: "DESC" },
			"device",
			"deviceFingerprint"
		])
	]);

	relations = {
		user: this.belongsTo(() => UserTable, {
			columns: ["userId"],
			references: ["userId"],
			foreignKey: false
		}),
	};
}