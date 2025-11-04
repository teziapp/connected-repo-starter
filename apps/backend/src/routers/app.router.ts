import { oauth2Router } from "@backend/routers/oauth2.router";
import { openapiPlugin } from "@backend/routers/openapi.plugin";
import { appTrpcRouter } from "@backend/routers/trpc.router";
import { createTRPCContext, type TrpcContext } from "@backend/trpc";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { FastifyInstance } from "fastify";

export const appRouter = (app: FastifyInstance) => {
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
      app.log.info("Root endpoint hit app.router.ts");
      return { message: "Backend is live." };
    },
  );

  app.get(
    "/health",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
            },
            required: ["status", "timestamp"],
          },
        },
      },
    },
    async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },
  );

  app.register(oauth2Router, {
    prefix: "/oauth2"
  });

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
          "tRPC error",
        );
      },
    },
  });

  app.register(openapiPlugin);
}