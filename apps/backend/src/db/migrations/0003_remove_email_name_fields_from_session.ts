import { change } from '../db_script';

change(async (db) => {
  await db.changeTable('accounts', (t) => ({
    ...t.drop(t.primaryKey(['id', 'provider_id'])),
    ...t.add(t.primaryKey(['id'])),
  }));

  await db.changeTable('sessions', (t) => ({
    email: t.drop(t.varchar(255)),
    name: t.drop(t.varchar(255)),
    image: t.drop(t.varchar(255).nullable()),
  }));
});
