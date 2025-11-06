import { BaseTable } from "@backend/db/base_table";

export class TeamMembersTable extends BaseTable {
  readonly table = "team_members";

  columns = this.setColumns((t) => ({
    teamMemberId: t.ulid().primaryKey(),
    teamId: t.uuid().foreignKey("teams", "teamId", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }),
    userId: t.uuid().foreignKey("users", "userId", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }),
    isAdmin: t.boolean().default(false),
    ...t.timestamps(),
  }));
}