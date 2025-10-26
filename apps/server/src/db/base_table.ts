import { createBaseTable } from "orchid-orm";

export const BaseTable = createBaseTable({
  autoForeignKeys: false,
  nowSQL: `now() AT TIME ZONE 'UTC'`,
	snakeCase: true,
	columnTypes: (t) => ({
		...t,
		 timestamps: () => ({
      createdAt: t.timestamps().createdAt.asNumber(),
      updatedAt: t.timestamps().updatedAt.asNumber(),
    }),
	}),
});

export const { sql } = BaseTable;