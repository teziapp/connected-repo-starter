import { prettifyError, z, ZodError } from "zod/v4";

const NODE_ENV = z.enum(["development", "staging", "production", "test"]);

const envSchemaZod = z.object({
  VITE_NODE_ENV: NODE_ENV,
  VITE_API_URL: z.url("API URL must be a valid URL"),
});

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