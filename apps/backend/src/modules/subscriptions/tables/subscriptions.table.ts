import { BaseTable } from "@backend/db/base_table";

export class SubscriptionsTable extends BaseTable {
  readonly table = "subscriptions";

  columns = this.setColumns((t) => ({
    subscriptionId: t.uuid().primaryKey(),
    teamId: t.uuid(),
    teamReferenceId: t.string(),
    maxRequests: t.integer(),
    expiresAt: t.timestamp(),
    requestsConsumed: t.integer().default(0),
    billingInvoiceNumber: t.string().nullable(),
    billingInvoiceDate: t.timestamp().nullable(),
    paymentReceivedDate: t.timestamp().nullable(),
    paymentTransactionId: t.string().nullable(),
    ...t.timestamps(),
  }));
}