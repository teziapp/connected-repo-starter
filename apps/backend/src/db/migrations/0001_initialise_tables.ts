import { change } from '../db_script';

change(async (db) => {
  await db.createEnum('public.api_product_enum', ['save_journal_entry']);

  await db.createEnum('public.api_request_method_enum', ['GET', 'POST', 'PUT', 'DELETE']);

  await db.createEnum('public.api_status_enum', ['AI Error', 'No active subscription', 'Requests exhausted', 'Pending', 'Server Error', 'Success']);

  await db.createEnum('public.webhook_status_enum', ['Pending', 'Sent', 'Failed']);

  await db.createTable('users', (t) => ({
    userId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.string().unique(),
    name: t.string().nullable(),
    displayPicture: t.string().nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable(
    'session',
    (t) => ({
      sessionId: t.string().primaryKey(),
      userId: t.uuid().nullable(),
      email: t.string(),
      name: t.string().nullable(),
      displayPicture: t.string().nullable(),
      ipAddress: t.string().nullable(),
      userAgent: t.text().nullable(),
      browser: t.string().nullable(),
      os: t.string().nullable(),
      device: t.string().nullable(),
      deviceFingerprint: t.string().nullable(),
      markedInvalidAt: t.timestamp().nullable(),
      expiresAt: t.timestamp(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => 
      t.index(
        [
          'sessionId',
          {
            column: 'expiresAt',
            order: 'DESC',
          },
          {
            column: 'markedInvalidAt',
            order: 'DESC',
          },
          'device',
          'deviceFingerprint',
        ]
      ),
  );

  await db.createTable('teams', (t) => ({
    teamId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    allowedDomains: t.array(t.string()),
    allowedIPs: t.array(t.string()),
    apiSecretHash: t.string().select(false),
    name: t.string(),
    rateLimitPerMinute: t.integer().select(false),
    subscriptionAlertWebhookUrl: t.string(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});

change(async (db) => {
  await db.createTable('journal_entries', (t) => ({
    journalEntryId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    prompt: t.string(500),
    content: t.text(),
    authorUserId: t.uuid().foreignKey('users', 'userId', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable('subscriptions', (t) => ({
    subscriptionId: t.string().primaryKey(),
    billingInvoiceNumber: t.string().nullable(),
    billingInvoiceDate: t.timestamp().nullable(),
    expiresAt: t.timestamp(),
    maxRequests: t.integer(),
    paymentReceivedDate: t.timestamp().nullable(),
    paymentTransactionId: t.string().nullable(),
    apiProductSku: t.enum('api_product_enum'),
    notifiedAt90PercentUse: t.timestamp().nullable(),
    requestsConsumed: t.integer(),
    teamId: t.uuid(),
    teamUserReferenceId: t.string(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable('api_product_request_logs', (t) => ({
    apiProductRequestId: t.string().primaryKey(),
    teamId: t.uuid(),
    teamUserReferenceId: t.string(),
    requestBodyText: t.text().nullable(),
    requestBodyJson: t.json().nullable(),
    method: t.enum('api_request_method_enum'),
    path: t.string(),
    ip: t.string(),
    status: t.enum('api_status_enum').default('Pending'),
    responseText: t.text().nullable(),
    responseJson: t.json().nullable(),
    responseTime: t.integer(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});

change(async (db) => {
  await db.createTable('subscription_usage_alert_queue', (t) => ({
    webhookCallQueueId: t.string().primaryKey(),
    teamId: t.uuid(),
    webhookUrl: t.string(),
    payload: t.json(),
    status: t.enum('webhook_status_enum'),
    attempts: t.integer().default(0),
    maxAttempts: t.integer().default(3),
    lastAttemptAt: t.timestamp().nullable(),
    scheduledFor: t.timestamp(),
    sentAt: t.timestamp().nullable(),
    subscriptionId: t.string().foreignKey('subscriptions', 'subscriptionId', {
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    }),
    errorMessage: t.text().nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});
