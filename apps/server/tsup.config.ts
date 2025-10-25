import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/server.ts"],
	format: ["cjs"],
	sourcemap: true,
	clean: true,
	target: "es2020",
	outDir: "dist",
	noExternal: [/.*/], // Bundle all dependencies for deployment
});
