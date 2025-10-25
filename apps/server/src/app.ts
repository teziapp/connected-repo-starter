import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { env } from "./configs/env.config";
import { loggerConfig } from "./configs/logger.config";
import { registerErrorHandler } from "./middlewares/errorHandler";
import { appTrpcRouter } from "./router.trpc";
import { createTRPCContext, type TrpcContext } from "./trpc";

export const app = fastify({
  logger: loggerConfig[env.NODE_ENV],
  maxParamLength: 5000,
});
export const logger = app.log;

// Define a simple route with Zod validation
app.get(
  "/",
  {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
      },
    },
  },
  async () => {
    app.log.info("Hello API endpoint hit app.log.info");
    return { message: "Hello API" };
  }
);

app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appTrpcRouter,
    createContext: createTRPCContext,
    /**
     * tRPC error logger for Fastify
     */
    onError({
      error,
      path,
      type,
      ctx,
      input,
    }: {
      error: Error;
      path?: string;
      type?: string;
      ctx?: TrpcContext;
      input?: unknown;
    }) {
     
      app.log.error(
        {
          error: error.message,
          stack: error.stack,
          path,
          type,
          input,
          userId: ctx?.userId,
        },
        "tRPC error"
      );
    },
  },
});

// Register central error handler
registerErrorHandler(app);


