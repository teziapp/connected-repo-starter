import { env, isDev, isProd, isStaging, isTest } from '@backend/configs/env.config';
import { betterAuthHandler } from '@backend/request_handlers/better_auth.handler';
import { allowedOrigins, userAppHandler } from '@backend/request_handlers/user_app.handler';
import { handleServerClose } from '@backend/utils/graceful_shutdown.utils';
import { logger } from '@backend/utils/logger.utils';
import { createServer } from 'node:http';

logger.info({ isDev, isProd, isStaging, isTest }, "Environment:");
logger.info(allowedOrigins, "Allowed Origins:");
logger.info(env.ALLOWED_ORIGINS, "ALLOWED_ORIGINS env:");

const start = async () => {
  try {

    const server = createServer(async (req, res) => {

      // Handle better-auth routes first (/api/auth/*)
      if (req.url?.startsWith("/api/auth")) {
        return betterAuthHandler.handle(req, res);
        // TODO: There is a better way of doing this. Needs research.
        // return auth.handler(req);
      }

       // Handle oRPC routes
       let result = await userAppHandler.handle(req, res, {
         context: {},
         prefix: '/user-app',
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

    handleServerClose(server)
  } catch (err) {
    logger.error("Server failed to start");
    logger.error(err);
    process.exit(1);
  }
};

if(!isTest) {
  start();
}

