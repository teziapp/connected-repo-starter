import { BaseTable } from "@backend/db/base_table";

export class VerificationTable extends BaseTable {
	readonly table = "verification";

	columns = this.setColumns((t) => ({
		identifier: t.string(),
		value: t.text(),
		expiresAt: t.timestampNumber(),
		...t.timestamps(),
	}),
	(t) => [
		t.primaryKey(["identifier", "value"]),
	]);
}