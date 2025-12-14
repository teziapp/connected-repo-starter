import { change } from '../db_script';

change(async (db) => {
  await db.changeTable('accounts', (t) => ({
    accountId: t.add(t.string()),
  }));
});
