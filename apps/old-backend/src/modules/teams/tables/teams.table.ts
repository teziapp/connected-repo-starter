import { BaseTable } from "@backend/db/base_table";

export class TeamTable extends BaseTable {
  readonly table = "teams";

  columns = this.setColumns((t) => ({
    teamId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),

    allowedDomains: t.array(t.string()),
    allowedIPs: t.array(t.string()),
    apiSecretHash: t.string().select(false),
    name: t.string(),
    rateLimitPerMinute: t.integer(),
    subscriptionAlertWebhookUrl: t.string(),
    subscriptionAlertWebhookBearerToken: t.string().nullable().select(false),
    ...t.timestamps(),
  }));
}