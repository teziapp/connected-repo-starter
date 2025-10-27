import { change } from '@server/db/db_script';

change(async (db) => {
  await db.createTable('user', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.string().unique(),
    name: t.string(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});

change(async (db) => {
  await db.createTable('post', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    title: t.string(),
    content: t.text(),
    authorId: t.uuid().foreignKey('user', 'id'),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});
