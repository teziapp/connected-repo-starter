import { rakeDb } from "orchid-orm/migrations/node-postgres";
import { BaseTable } from "./base_table";
import { dbConfig } from "./config";

export const change = rakeDb([dbConfig], {
	baseTable: BaseTable,
	dbPath: "./db",
	migrationId: "serial",
	migrationsPath: "./migrations",
	commands: {
		async seed() {
			const { seed } = await import("./seed/index.js");
			await seed();
		},
	},
	import: (path) => import(path),
	//   beforeMigrate?(db: Db): Promise<void>;
	//   afterMigrate?(db: Db): Promise<void>;
	//   beforeRollback?(db: Db): Promise<void>;
	//   afterRollback?(db: Db): Promise<void>;
});
