import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { envValidationVitePlugin } from "./src/utils/env_validation_vite_plugin.utils";

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [envValidationVitePlugin(), react()],
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
				//     console.log('Creating separate chunk for zod_schemas:', id);
				//     return 'zod_schemas';
				//   }
				// }
			},
		},
	},
});
