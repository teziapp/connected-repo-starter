import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/**/*.{ts,tsx}"],
	format: ["esm"], // ESM only for proper tree shaking
	dts: true,
	sourcemap: true,
	clean: true,
	splitting: true,
	treeshake: true,
	minify: false, // Keep readable for debugging, enable in production
	target: "es2022",
	outDir: "dist",
	external: ["react", "react-dom"], // Don't bundle React
});
