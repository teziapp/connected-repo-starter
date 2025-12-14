import { change } from '../db_script';

change(async (db) => {
  await db.changeTable('sessions', (t) => ({
    deviceFingerprint: t.change(t.varchar(255), t.string().nullable()),
  }));
});
