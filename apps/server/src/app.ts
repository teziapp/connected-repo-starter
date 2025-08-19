import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { env } from "./configs/env.config";
import { loggerConfig } from "./configs/logger.config";
import { registerErrorHandler } from "./middlewares/errorHandler";
import { appTrpcRouter } from "./router.trpc";
import { createTRPCContext, type TrpcContext } from "./trpc";
import * as tracker from "@middleware.io/node-apm";
import { trace, SpanStatusCode, SpanKind } from "@opentelemetry/api";

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
      const tracer = trace.getTracer("trpc-error-handler");

      // Create a new span specifically for the error
      const errorSpan = tracer.startSpan(`trpc.error.${path || "unknown"}`, {
        kind: SpanKind.SERVER,
        attributes: {
          "trpc.procedure.path": path || "unknown",
          "trpc.procedure.type": type || "unknown",
          "user.id": ctx?.userId || "anonymous",
          "error.type": "trpc_procedure_error",
        },
      });

      // Record the error on the new span
      errorSpan.recordException(error);
      errorSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      // Add error-specific attributes
      errorSpan.setAttributes({
        "trpc.error.code": "INTERNAL_ERROR",
        "trpc.error.name": error.name,
        "trpc.error.message": error.message,
      });

      // Add an event if needed
      errorSpan.addEvent("trpc.procedure.failed", {
        "error.message": error.message,
        "procedure.path": path || "unknown",
      });

      // End the error span
      errorSpan.end();
      //   const span = trace.getActiveSpan();
      // //   console.log("span got", span);
      //   // Enhance span with error information
      //   if (span) {
      //     span.recordException(error);
      //     span.setStatus({
      //       code: SpanStatusCode.ERROR,
      //       message: error.message,
      //     });

      //     // Add relevant attributes
      //     span.setAttributes({
      //       "trpc.error.code": "INTERNAL_ERROR",
      //       "trpc.error.name": error.name,
      //       "trpc.procedure.path": path || "unknown",
      //       "trpc.procedure.type": type || "unknown",
      //       "user.id": ctx?.userId || "anonymous",
      //     });

      // 	console.log("span set attributes", span.);
      //   }

      //   // Track error with your existing tracker
      //   tracker.errorRecord(error);

      //   tracker.errorRecord(error);
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


