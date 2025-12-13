import { BaseTable } from "@backend/db/base_table";
import { SubscriptionsTable } from "@backend/modules/subscriptions/tables/subscriptions.table";

export class WebhookCallQueueTable extends BaseTable {
  readonly table = "webhook_call_queue";

  columns = this.setColumns(
    (t) => ({
      webhookCallQueueId: t.ulid().primaryKey(),

      teamId: t.uuid(),
      webhookUrl: t.string(),
      payload: t.json(),
      status: t.webhookStatusEnum(),
      attempts: t.integer().default(0),
      maxAttempts: t.integer(),
      lastAttemptAt: t.timestampNumber().nullable(),
      scheduledFor: t.timestampNumber(),
      sentAt: t.timestampNumber().nullable(),
      subscriptionId: t.string().foreignKey(() => SubscriptionsTable, "subscriptionId", {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT"
      }),
      errorMessage: t.text().nullable(),

      ...t.timestamps(),
    }),
    (t) => t.index(['status', 'scheduledFor'])
  );
}