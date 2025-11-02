import { change } from '../db_script';

change(async (db) => {
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
});

change(async (db) => {
  await db.createTable('posts', (t) => ({
    postId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    title: t.string(),
    content: t.text(),
    authorUserId: t.uuid().foreignKey('users', 'userId', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});
