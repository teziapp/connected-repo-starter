#!/usr/bin/env node

/**
 * Syncs environment variables from root .env to workspace .env files
 * Only syncs variables that are already defined in the workspace .env files
 */

const fs = require("fs");
const path = require("path");

// Paths
const ROOT_ENV = path.join(__dirname, "../.env");
const WORKSPACES = [path.join(__dirname, "../apps/backend/.env"), path.join(__dirname, "../apps/frontend/.env")];

/**
 * Parse .env file into key-value object
 */
function parseEnvFile(filePath) {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	const content = fs.readFileSync(filePath, "utf8");
	const env = {};

	content.split("\n").forEach((line) => {
		line = line.trim();

		// Skip empty lines and comments
		if (!line || line.startsWith("#")) {
			return;
		}

		// Parse KEY=VALUE
		const match = line.match(/^([^=]+)=(.*)$/);
		if (match) {
			const key = match[1].trim();
			const value = match[2].trim();
			env[key] = value;
		}
	});

	return env;
}

/**
 * Update workspace .env file with values from root .env
 * Only updates keys that already exist in the workspace file
 */
function syncEnvFile(workspacePath, rootEnv) {
	if (!fs.existsSync(workspacePath)) {
		console.log(`⏭️  Skipping ${path.relative(process.cwd(), workspacePath)} (file doesn't exist)`);
		return;
	}

	const content = fs.readFileSync(workspacePath, "utf8");
	const lines = content.split("\n");
	const updatedLines = [];
	let updatedCount = 0;
	const isBackendWorkspace = workspacePath.includes("apps/backend");

	lines.forEach((line) => {
		const trimmed = line.trim();

		// Keep comments and empty lines as-is
		if (!trimmed || trimmed.startsWith("#")) {
			updatedLines.push(line);
			return;
		}

		// Parse KEY=VALUE
		const match = trimmed.match(/^([^=]+)=(.*)$/);
		if (match) {
			const key = match[1].trim();
			const currentValue = match[2].trim();

			// Special case: sync VITE_NODE_ENV to NODE_ENV for server workspace
			if (isBackendWorkspace && key === "NODE_ENV" && "VITE_NODE_ENV" in rootEnv) {
				const rootValue = rootEnv["VITE_NODE_ENV"];
				if (currentValue !== rootValue) {
					updatedLines.push(`${key}=${rootValue}`);
					updatedCount++;
					console.log(`  ✓ Updated ${key} (from VITE_NODE_ENV)`);
				} else {
					updatedLines.push(line);
				}
			}
			// If this key exists in root .env, sync it
			else if (key in rootEnv) {
				const rootValue = rootEnv[key];
				if (currentValue !== rootValue) {
					updatedLines.push(`${key}=${rootValue}`);
					updatedCount++;
					console.log(`  ✓ Updated ${key}`);
				} else {
					updatedLines.push(line);
				}
			} else {
				// Keep the line as-is if key doesn't exist in root
				updatedLines.push(line);
			}
		} else {
			updatedLines.push(line);
		}
	});

	// Write updated content
	if (updatedCount > 0) {
		fs.writeFileSync(workspacePath, updatedLines.join("\n"));
		console.log(`✅ Synced ${updatedCount} variable(s) to ${path.relative(process.cwd(), workspacePath)}\n`);
	} else {
		console.log(`✓ ${path.relative(process.cwd(), workspacePath)} is up to date\n`);
	}
}

/**
 * Main function
 */
function main() {
	console.log("🔄 Syncing environment variables from root .env...\n");

	// Check if root .env exists
	if (!fs.existsSync(ROOT_ENV)) {
		console.error("❌ Root .env file not found!");
		process.exit(1);
	}

	// Parse root .env
	const rootEnv = parseEnvFile(ROOT_ENV);
	console.log(`📄 Loaded ${Object.keys(rootEnv).length} variables from root .env\n`);

	// Sync each workspace
	WORKSPACES.forEach((workspacePath) => {
		syncEnvFile(workspacePath, rootEnv);
	});

	console.log("✨ Environment sync complete!");
}

main();
