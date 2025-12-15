import { logger } from "@backend/utils/logger.utils";
import { IncomingMessage, Server, ServerResponse } from "node:http";

export const handleServerClose = (server: Server<typeof IncomingMessage, typeof ServerResponse>) => {
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
}