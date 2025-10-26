import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { analyzer } from 'vite-bundle-analyzer';
import { envValidationVitePlugin } from "./src/utils/env_validation_vite_plugin.utils";

const statsPath = path.resolve(__dirname, ".dev", "stats.json");

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [
		envValidationVitePlugin(), 
		react(), 
		analyzer({
			analyzerMode: "json",
			fileName: statsPath,
			// Use the below when output needed is html
			// enabled: false,
			// analyzerMode: "static",
			// fileName: ".dev/stats.html",
			// openAnalyzer: true,
		})
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// react: ['react', 'react-dom'],
					// Add other big libs as needed
					// zod: ['zod', '@connected-repo/zod-schemas'],
				},
				// manualChunks(id) {
				//   if (id.includes('zod')) {
				//     console.log('Creating separate chunk for zod-schemas:', id);
				//     return 'zod-schemas';
				//   }
				// }
			},
		},
	},
});
