import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class ApiProductRequestLogsTable extends BaseTable {
  readonly table = "api_product_request_logs";
  
  columns = this.setColumns(
    (t) => ({
      apiProductRequestId: t.ulid().primaryKey(),
      teamId: t.uuid(),
      teamUserReferenceId: t.string(),
      requestBodyText: t.text().nullable(),
      requestBodyJson: t.json().nullable(),
      method: t.apiRequestMethodEnum(),
      path: t.string(),
      ip: t.string(),
      status: t.apiProductRequestStatusEnum().default("Pending"),
      responseText: t.text().nullable(),
      responseJson: t.json().nullable(),
      responseTime: t.integer(),
      ...t.timestamps(),
    }),
    (t) => t.index([
      "teamId", 
      {column: "createdAt", order: "DESC"}
    ]),
  );

  relations = {
    author: this.belongsTo(() => UserTable, {
      columns: ["teamUserReferenceId"],
      references: ["id"],
      foreignKey: false // Disable foreign key constraint so that detail is not lost from logs.
    }),
  }
}