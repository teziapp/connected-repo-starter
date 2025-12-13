import { change } from '../db_script';

change(async (db) => {
  await db.createTable(
    'account',
    (t) => ({
      accountId: t.string(),
      userId: t.uuid(),
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
    (t) => [
      t.primaryKey(['accountId', 'providerId']),
      t.index(['userId']),
    ],
  );

  await db.createTable(
    'verification',
    (t) => ({
      identifier: t.string(),
      value: t.text(),
      expiresAt: t.timestamp(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.primaryKey(['identifier', 'value']),
  );

  await db.changeTable('journal_entries', (t) => ({
    promptId: t.change(t.smallint(), t.smallint().nullable()),
  }));

  await db.changeTable('session', (t) => ({
    token: t.add(t.string().unique()),
  }));
});
