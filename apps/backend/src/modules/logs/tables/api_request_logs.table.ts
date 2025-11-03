import { BaseTable } from "@backend/db/base_table";
import { ulid } from "ulid";

export class ApiRequestLogsTable extends BaseTable {
  readonly table = "api_request_logs";
  
  columns = this.setColumns((t) => ({
    apiRequestId: t.string().primaryKey().default(() => ulid()),
    teamId: t.uuid(),
    teamReferenceId: t.string(),
    requestBodyText: t.text(),
    requestBodyJson: t.json(),
    method: t.string(),
    path: t.string(),
    ip: t.string(),
    status: t.apiStatusEnum(),
    responseText: t.text(),
    responseJson: t.json(),
    responseTime: t.integer(),
    ...t.timestamps(),
  }));
}