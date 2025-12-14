import { BaseTable, sql } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/users/users.table";

export class SessionTable extends BaseTable {
	readonly table = "session";

	columns = this.setColumns((t) => ({
		sessionId: t.string().primaryKey(),
		userId: t.uuid().nullable(),
		email: t.string(),
		name: t.string().nullable(),
		displayPicture: t.string().nullable(),
		ipAddress: t.string().nullable(),
		userAgent: t.text().nullable(),
		browser: t.string().nullable(),
		os: t.string().nullable(),
		device: t.string().nullable(),
		deviceFingerprint: t.string().nullable(),
		markedInvalidAt: t.timestampNumber().nullable(),
		expiresAt: t.timestampNumber(),
		...t.timestamps(),
	}),
	(t) => [
		t.index([
			"sessionId", 
			{ column: "expiresAt", order: "DESC" }, 
			{ column: "markedInvalidAt", order: "DESC" }
		])
	]);

	relations = {
		user: this.belongsTo(() => UserTable, {
			columns: ["userId"],
			references: ["userId"],
			// Foreign Key is set to false to preserve userId data in event of user deletion.
			foreignKey: false
		}),
	};

	scopes = this.setScopes({
		default: (q) => q.where({ 
			expiresAt: {
				gt: sql`NOW()`
			},
			markedInvalidAt: null 
		}),
	})
}