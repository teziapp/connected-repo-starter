import { BaseTable } from "@backend/db/base_table";
import { WebhookCallQueueTable } from "@backend/modules/subscriptions/tables/webhookCallQueue.table";
import { ulid } from "ulid";

export class SubscriptionsTable extends BaseTable {
  readonly table = "subscriptions";

  columns = this.setColumns((t) => ({
    subscriptionId: t.string().primaryKey().default(() => ulid()),

    billingInvoiceNumber: t.string().nullable(),
    billingInvoiceDate: t.timestamp().nullable(),
    expiresAt: t.timestamp(),
    maxRequests: t.integer(),
    paymentReceivedDate: t.timestamp().nullable(),
    paymentTransactionId: t.string().nullable(),
    apiProductSku: t.apiProductSkuEnum(),
    notifiedAt90PercentUse: t.timestamp().nullable(),
    requestsConsumed: t.integer(),
    teamId: t.uuid(),
    teamUserReferenceId: t.string(),
    ...t.timestamps(),
  }));

  relations = {
    webHooksCalled: this.hasMany(() => WebhookCallQueueTable, {
      columns: ["subscriptionId"],
      references: ["subscriptionId"],
    }),
  }
}