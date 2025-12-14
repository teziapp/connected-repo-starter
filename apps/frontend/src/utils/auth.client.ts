import { createAuthClient } from "better-auth/client";
import { env } from "@frontend/configs/env.config";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
});