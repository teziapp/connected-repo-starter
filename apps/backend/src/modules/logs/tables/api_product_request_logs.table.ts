import { BaseTable } from "@backend/db/base_table";
import { ulid } from "ulid";

export class ApiProductRequestLogsTable extends BaseTable {
  readonly table = "api_product_request_logs";
  
  columns = this.setColumns((t) => ({
    apiProductRequestId: t.string().primaryKey().default(() => ulid()),
    teamId: t.uuid(),
    teamUserReferenceId: t.string(),
    requestBodyText: t.text().nullable(),
    requestBodyJson: t.json().nullable(),
    method: t.apiRequestMethodEnum(),
    path: t.string(),
    ip: t.string(),
    status: t.apiProductRequestStatusEnum().default("Pending"),
    responseText: t.text(),
    responseJson: t.json(),
    responseTime: t.integer(),
    ...t.timestamps(),
  }));
}