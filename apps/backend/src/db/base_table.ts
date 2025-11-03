import { API_REQUEST_STATUS_ENUM } from "@connected-repo/zod-schemas/enums.zod";
import { createBaseTable } from "orchid-orm";

export const BaseTable = createBaseTable({
  autoForeignKeys: false,
  nowSQL: `now() AT TIME ZONE 'UTC'`,
	snakeCase: true,
	columnTypes: (t) => ({
		...t,
    apiStatusEnum: () => t.enum("api_status_enum", API_REQUEST_STATUS_ENUM),
		timestamps: () => ({
      createdAt: t.timestamps().createdAt.asNumber(),
      updatedAt: t.timestamps().updatedAt.asNumber(),
    }),
	}),
});

export const { sql } = BaseTable;