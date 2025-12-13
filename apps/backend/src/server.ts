import { env, isDev, isProd, isStaging, isTest } from '@backend/configs/env.config'
import { router } from '@backend/router'
import { LoggingHandlerPlugin } from '@orpc/experimental-pino'
import { onError, ORPCError, ValidationError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin, RequestHeadersPlugin, SimpleCsrfProtectionHandlerPlugin, StrictGetMethodPlugin } from '@orpc/server/plugins'
import { createServer } from 'node:http'
import pino from 'pino'
import { ZodError } from 'zod'
import { $ZodIssue, flattenError, prettifyError } from 'zod/v4/core'

const allowedOrigins = [...(env.ALLOWED_ORIGINS?.split(",") || [])];
const logger = pino();

logger.info({ isDev, isProd, isStaging, isTest }, "Environment:");
logger.info(allowedOrigins, "Allowed Origins:");
logger.info(env.ALLOWED_ORIGINS, "ALLOWED_ORIGINS env:");

const handler = new RPCHandler(router, {
  plugins: [
    // Request headers plugin for accessing headers in context
    new RequestHeadersPlugin(),
    // CORS configuration with credentials support
    new CORSPlugin({
      origin: [...allowedOrigins],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
    // FIXME: Using rate-limit throws an error. Try later at the end.
    // Rate limiting at handler level
    // new RatelimitHandlerPlugin(),
    // Structured logging with Pino
    new LoggingHandlerPlugin({
      logger,
      logRequestResponse: !isProd, // Only log in dev/staging
      logRequestAbort: true,
    }),
    // CSRF protection (disabled in development for easier testing)
    ...(isProd || isStaging ? [new SimpleCsrfProtectionHandlerPlugin()] : []),
    // Strict GET method plugin (queries must use GET)
    new StrictGetMethodPlugin(),
  ],
  interceptors: [
    // Server-side error logging
    onError((error) => {
      logger.error(error, 'Server error');
    }),
  ],
  clientInterceptors: [
    // Client-side error transformation
    onError((error) => {
      // Handle Zod validation errors for input
      if (
        error instanceof ORPCError
        && error.code === 'BAD_REQUEST'
        && error.cause instanceof ValidationError
      ) {
        const zodError = new ZodError(error.cause.issues as $ZodIssue[])

        throw new ORPCError('INPUT_VALIDATION_FAILED', {
          status: 422,
          message: prettifyError(zodError),
          data: flattenError(zodError),
          cause: error.cause,
        })
      }

      // Handle Zod validation errors for output
      if (
        error instanceof ORPCError
        && error.code === 'INTERNAL_SERVER_ERROR'
        && error.cause instanceof ValidationError
      ) {
        throw new ORPCError('OUTPUT_VALIDATION_FAILED', {
          cause: error.cause,
        })
      }
    }),
  ],
})

const start = async () => {
  try {
    const server = createServer(async (req, res) => {
      const result = await handler.handle(req, res, {
        context: {}
      })

      if (!result.matched) {
        res.statusCode = 404
        res.end('No procedure matched')
      }
    })

    // Configure server to close idle connections
    server.keepAliveTimeout = 5000; // 5 seconds
    server.headersTimeout = 6000; // 6 seconds (must be higher than keepAliveTimeout)

    server.listen(
      3000,
      '127.0.0.1',
      () => {
        if (process.send) {
          process.send("ready"); // ✅ Let PM2 know the app is ready
        }
        logger.info({ url: env.VITE_API_URL }, "Server running");
      }
    );

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal, closing server gracefully...');

      // Stop accepting new connections
      server.close(() => {
        logger.info('Server closed successfully');
        process.exit(0);
      });

      // Destroy all active connections after a short delay
      setTimeout(() => {
        logger.info('Destroying active connections...');
        server.closeAllConnections();
      }, 100);

      // Force shutdown after 5 seconds (reduced from 10)
      setTimeout(() => {
        logger.error('Forcefully shutting down after timeout');
        process.exit(1);
      }, 5000);
    };

    // Handle various termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught exception');
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled rejection');
      gracefulShutdown('unhandledRejection');
    });

  } catch (err) {
    logger.error("Server failed to start");
    logger.error(err);
    process.exit(1);
  }
};

if(!isTest) {
  start();
}

