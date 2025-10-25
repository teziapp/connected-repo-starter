import { loadEnv, type Plugin } from "vite";
import { prettifyError, ZodError } from "zod";
import { envSchemaZod } from "./env_validator.zod.utils";

export const validateEnvironment = (input: unknown) => {
  try {
    return envSchemaZod.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(prettifyError(error));
      throw new Error("Environment validation failed. Check console for details.");
    }
    throw error;
  }
};

export const envValidationVitePlugin = (): Plugin => {
  return {
    name: "env-validation",
    config(config, { mode }) {
      const env = loadEnv(mode, process.cwd(), ["VITE_"]);
      validateEnvironment(env);
      return config;
    },
  };
}