import { auth } from '@backend/modules/auth/auth.config';
import { allowedOrigins } from "@backend/request_handlers/user_app.handler";
import { toNodeHandler } from 'better-auth/node';
import { IncomingMessage, ServerResponse } from "node:http";

export const betterAuthHandler = {
  handle: (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage> & { req: IncomingMessage;}
  ) => {
      // Create better-auth Node.js handler
      const authHandler = toNodeHandler(auth);
      
      // Handle CORS for auth routes separately, following oRPC CORSPlugin best practices
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      return authHandler(req, res);

    }
}