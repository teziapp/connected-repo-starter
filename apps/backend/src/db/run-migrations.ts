#!/usr/bin/env node
/*
 * Smart migration runner for production deployments
 *
 * This script safely runs pending database migrations on container startup.
 * - Only executes migrations that haven't been applied yet
 * - Idempotent: safe to run multiple times
 * - Exits with proper status codes for container health checks
 * - Logs migration status for monitoring
 */

import "dotenv/config";
import { BaseTable } from "@backend/db/base_table";
import { dbConfig } from "@backend/db/config";
import { rakeDb } from "orchid-orm/migrations/node-postgres";

const runMigrations = async () => {
	console.log("🔍 Checking for pending migrations...");

	// Track applied migrations via callback
	// MigrationItem type: { path: string; version: string; load(): Promise<unknown> }
	let appliedMigrations: Array<{ path: string; version: string }> = [];

	const { run } = rakeDb.lazy([dbConfig], {
		baseTable: BaseTable,
		dbPath: "apps/backend/src/db",
		migrationId: "serial",
		migrationsPath: "apps/backend/src/db/migrations",
		import: (path) => import(path),
		// Callback fires after migrations are applied
		async afterMigrate({ migrations }) {
			appliedMigrations = migrations;
		},
	});

	try {
		// Run migrations - this is idempotent and only applies pending migrations
		await run(["migrate"]);

		// Check if any migrations were applied
		if (appliedMigrations.length > 0) {
			console.log(`✅ Applied ${appliedMigrations.length} migration(s):`);
			for (const migration of appliedMigrations) {
				// MigrationItem has path and version properties
				console.log(`   - ${migration.version}`);
			}
		} else {
			console.log("✅ Database is up to date - no pending migrations");
		}

		console.log("✅ Migration check completed successfully");
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:");
		console.error(error);
		process.exit(1);
	}
};

// Only run if this file is executed directly (not imported)
if (require.main === module) {
	runMigrations();
}

export { runMigrations };
