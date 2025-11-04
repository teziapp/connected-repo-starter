import { BaseTable } from "@backend/db/base_table";
import { SubscriptionsTable } from "@backend/modules/subscriptions/tables/subscriptions.table";
import { ulid } from "ulid";

export class WebhookCallQueueTable extends BaseTable {
  readonly table = "subscription_usage_alert_queue";

  columns = this.setColumns((t) => ({
    webhookCallQueueId: t.string().primaryKey().default(() => ulid()),

    teamId: t.uuid(),
    webhookUrl: t.string(),
    payload: t.json(),
    status: t.webhookStatusEnum(),
    attempts: t.integer().default(0),
    maxAttempts: t.integer().default(3),
    lastAttemptAt: t.timestamp().nullable(),
    scheduledFor: t.timestamp(),
    sentAt: t.timestamp().nullable(),
    subscriptionId: t.string().foreignKey(() => SubscriptionsTable, "subscriptionId", {
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    }),
    errorMessage: t.text().nullable(),

    ...t.timestamps(),
  }));
}