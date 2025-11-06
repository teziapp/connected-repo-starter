import { BaseTable } from "@backend/db/base_table";
import { WebhookCallQueueTable } from "@backend/modules/subscriptions/tables/webhookCallQueue.table";
import { UserTable } from "@backend/modules/users/users/users.table";

export class SubscriptionsTable extends BaseTable {
  readonly table = "subscriptions";

  columns = this.setColumns((t) => ({
    subscriptionId: t.ulid().primaryKey(),

    
    expiresAt: t.timestampNumber(),
    maxRequests: t.integer(),
    apiProductSku: t.apiProductSkuEnum(),
    requestsConsumed: t.integer(),
    teamId: t.uuid(),
    teamUserReferenceId: t.string(),

    billingInvoiceNumber: t.string().nullable(),
    billingInvoiceDate: t.timestampNumber().nullable(),
    notifiedAt90PercentUse: t.timestampNumber().nullable(),
    paymentReceivedDate: t.timestampNumber().nullable(),
    paymentTransactionId: t.string().nullable(),

    ...t.timestamps(),
    }), 
    (t) => t.index(['teamId', 'teamUserReferenceId', 'apiProductSku'])
  );

  relations = {
    webHooksCalled: this.hasMany(() => WebhookCallQueueTable, {
      columns: ["subscriptionId"],
      references: ["subscriptionId"],
    }),
    user: this.belongsTo(() => UserTable, {
      columns: ["teamUserReferenceId"],
      references: ["userId"],
      foreignKey: false // Disable foreign key constraint so that detail is not lost from subscriptions.
    }),
  }
}