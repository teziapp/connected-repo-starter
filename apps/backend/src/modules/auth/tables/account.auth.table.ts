import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/tables/users.table";
import { ulid } from "ulid";

export class AccountTable extends BaseTable {
	readonly table = "accounts";

	columns = this.setColumns((t) => ({
		id: t.string().default(() => ulid()).primaryKey(),
		userId: t.uuid(),
		accountId: t.string(), // The ID of the account as provided by the SSO or equal to userId for credential accounts
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
		t.index(["userId"]),
	]);

	relations = {
		user: this.belongsTo(() => UserTable, {
			columns: ["userId"],
			references: ["id"],
			foreignKey: false
		}),
	};
}