import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { envValidationVitePlugin } from "./src/utils/env_validation_vite_plugin.utils";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    envValidationVitePlugin(),
    react()
  ],
})
