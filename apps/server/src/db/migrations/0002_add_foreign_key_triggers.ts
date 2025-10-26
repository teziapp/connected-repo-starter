import { change } from '../db_script';

change(async (db) => {
  await db.changeTable('post', (t) => ({
    ...t.drop(
      t.foreignKey(
        ['author_id'],
        'public.user',
        ['id'],
      ),
    ),
    ...t.add(
      t.foreignKey(
        ['author_id'],
        'user',
        ['id'],
        {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        },
      ),
    ),
  }));
});
