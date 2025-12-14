import { BaseTable, sql } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/tables/users.table";
import { Selectable } from "orchid-orm";
import { ulid } from "ulid";

export class SessionTable extends BaseTable {
	readonly table = "sessions";

	columns = this.setColumns((t) => ({
		id: t.string().default(() => ulid()).primaryKey(),
		token: t.string(),
		userId: t.uuid().nullable(),
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
			"id", 
			{ column: "expiresAt", order: "DESC" }, 
			{ column: "markedInvalidAt", order: "DESC" }
		])
	]);

	relations = {
		user: this.belongsTo(() => UserTable, {
			columns: ["userId"],
			references: ["id"],
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
};

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type NonNullableField<T, K extends keyof T> = T &
NonNullableFields<Pick<T, K>>;

export type ActiveSessionSelectAll = NonNullableField<Selectable<SessionTable>, "userId">;