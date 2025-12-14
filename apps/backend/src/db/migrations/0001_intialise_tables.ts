import { change } from '../db_script';

change(async (db) => {
  await db.createEnum('public.api_product_enum', ['journal_entry_create']);

  await db.createEnum('public.api_request_method_enum', ['GET', 'POST', 'PUT', 'DELETE']);

  await db.createEnum('public.api_status_enum', ['AI Error', 'No active subscription', 'Requests exhausted', 'Pending', 'Server Error', 'Success']);

  await db.createEnum('public.webhook_status_enum', ['Pending', 'Sent', 'Failed']);

  await db.createTable('users', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.string().unique(),
    emailVerified: t.boolean().default(false),
    name: t.string(),
    image: t.string().nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable('prompts', (t) => ({
    promptId: t.smallint().identity().primaryKey(),
    text: t.string(500),
    category: t.string(100).nullable(),
    tags: t.array(t.string()).nullable(),
    isActive: t.boolean().default(true),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable(
    'sessions',
    (t) => ({
      id: t.string().primaryKey(),
      token: t.string(),
      userId: t.uuid().nullable(),
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
          'id',
          {
            column: 'expiresAt',
            order: 'DESC',
          },
          {
            column: 'markedInvalidAt',
            order: 'DESC',
          },
        ]
      ),
  );

  await db.createTable(
    'accounts',
    (t) => ({
      id: t.string().primaryKey(),
      userId: t.uuid(),
      accountId: t.string(),
      providerId: t.string(),
      accessToken: t.text().nullable(),
      refreshToken: t.text().nullable(),
      accessTokenExpiresAt: t.timestamp().nullable(),
      refreshTokenExpiresAt: t.timestamp().nullable(),
      scope: t.text().nullable(),
      idToken: t.text().nullable(),
      password: t.text().nullable(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.index(['userId']),
  );

  await db.createTable(
    'verifications',
    (t) => ({
      identifier: t.string(),
      value: t.text(),
      expiresAt: t.timestamp(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.primaryKey(['identifier', 'value']),
  );

  await db.createTable('teams', (t) => ({
    teamId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    allowedDomains: t.array(t.string()),
    allowedIPs: t.array(t.string()),
    apiSecretHash: t.string().select(false),
    name: t.string(),
    rateLimitPerMinute: t.integer(),
    subscriptionAlertWebhookUrl: t.string(),
    subscriptionAlertWebhookBearerToken: t.string().select(false).nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});

change(async (db) => {
  await db.createTable('journal_entries', (t) => ({
    journalEntryId: t.string(26).primaryKey(),
    prompt: t.string(500).nullable(),
    promptId: t.smallint().foreignKey('prompts', 'promptId', {
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    }).nullable(),
    content: t.text(),
    authorUserId: t.uuid().foreignKey('users', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable(
    'subscriptions',
    (t) => ({
      subscriptionId: t.string(26).primaryKey(),
      expiresAt: t.timestamp(),
      maxRequests: t.integer(),
      apiProductSku: t.enum('api_product_enum'),
      apiProductQuantity: t.smallint(),
      requestsConsumed: t.integer(),
      teamId: t.uuid(),
      teamUserReferenceId: t.string(),
      billingInvoiceNumber: t.string().nullable(),
      billingInvoiceDate: t.timestamp().nullable(),
      notifiedAt90PercentUse: t.timestamp().nullable(),
      paymentReceivedDate: t.timestamp().nullable(),
      paymentTransactionId: t.string().nullable(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.index(['teamId', 'teamUserReferenceId', 'apiProductSku']),
  );

  await db.createTable(
    'api_product_request_logs',
    (t) => ({
      apiProductRequestId: t.string(26).primaryKey(),
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
    }),
    (t) => 
      t.index(
        [
          'teamId',
          {
            column: 'createdAt',
            order: 'DESC',
          },
        ]
      ),
  );
});

change(async (db) => {
  await db.createTable(
    'webhook_call_queue',
    (t) => ({
      webhookCallQueueId: t.string(26).primaryKey(),
      teamId: t.uuid(),
      webhookUrl: t.string(),
      payload: t.json(),
      status: t.enum('webhook_status_enum'),
      attempts: t.integer().default(0),
      maxAttempts: t.integer(),
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
    }),
    (t) => t.index(['status', 'scheduledFor']),
  );
});
