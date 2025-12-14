import { BaseTable } from "@backend/db/base_table";

export class UserTable extends BaseTable {
	readonly table = "users";

	columns = this.setColumns((t) => ({
		id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		email: t.string().unique(),
		emailVerified: t.boolean().default(false),
		name: t.string(),
		image: t.string().nullable(),
		...t.timestamps(),
	}));
}