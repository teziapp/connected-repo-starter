import { BaseTable } from "@backend/db/base_table";

export class ApiRequestLogsTable extends BaseTable {
  readonly table = "api_request_logs";
  readonly noprimaryKey = true;
  
  columns = this.setColumns((t) => ({
    apiRequestId: t.uuid(),
    teamId: t.uuid(),
    requestBodyText: t.text(),
    requestBodyJson: t.json(),
    method: t.string(),
    path: t.string(),
    ip: t.string(),
    responseText: t.text(),
    responseJson: t.json(),
    responseTime: t.integer(),
    ...t.timestamps(),
  }));
}