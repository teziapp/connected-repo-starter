import { BaseTable } from "@backend/db/base_table";

export class TeamTable extends BaseTable {
  readonly table = "teams";

  columns = this.setColumns((t) => ({
    teamId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    name: t.string(),
    apiSecret: t.string().default(t.sql`gen_random_uuid()`),
    allowedDomains: t.array(t.string()).default([]),
    ...t.timestamps(),
  }));
}