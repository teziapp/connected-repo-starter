import { BaseTable, sql } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/users/users.table";

export class AccountTable extends BaseTable {
	readonly table = "account";

	columns = this.setColumns((t) => ({
		accountId: t.string(),
		userId: t.uuid(),
		providerId: t.string(),
		accessToken: t.text().nullable(),
		refreshToken: t.text().nullable(),
		accessTokenExpiresAt: t.timestampNumber().nullable(),
		refreshTokenExpiresAt: t.timestampNumber().nullable(),
		scope: t.text().nullable(),
		idToken: t.text().nullable(),
		password: t.text().nullable(),
		...t.timestamps(),
	}),
	(t) => [
		t.primaryKey(["accountId", "providerId"]),
		t.index(["userId"]),
	]);

	relations = {
		user: this.belongsTo(() => UserTable, {
			columns: ["userId"],
			references: ["userId"],
			foreignKey: false
		}),
	};
}