import { loadEnv, type Plugin } from "vite";
import { validateEnvironment } from "./env_validator.zod.utils";

export function envValidationVitePlugin(): Plugin {
  return {
    name: "env-validation",
    config(config, { command, mode }) {
      if (command === "build") {
        const env = loadEnv(mode, process.cwd(), ["VITE_"]);
        console.log({env});
        validateEnvironment(env);
      }
      return config;
    },
  } as Plugin;
}