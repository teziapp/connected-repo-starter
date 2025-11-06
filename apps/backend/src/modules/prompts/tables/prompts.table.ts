import { BaseTable } from "@backend/db/base_table";

export class PromptsTable extends BaseTable {
	readonly table = "prompts";

	columns = this.setColumns((t) => ({
		promptId: t.smallint().identity().primaryKey(),

		text: t.string(500),
		category: t.string(100).nullable(),
		tags: t.array(t.string()).nullable(),
		isActive: t.boolean().default(true),

		...t.timestamps(),
	}));
}
