import { env } from "@frontend/configs/env.config";
import { createORPCClient, onError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { SimpleCsrfProtectionLinkPlugin } from '@orpc/client/plugins';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { UserAppRouter } from "../../../backend/src/routers/user_app/user_app.router";

interface ClientContext {
  something?: string
}

const link = new RPCLink<ClientContext>({
  url: env.VITE_API_URL + "/user-app",
  headers: ({ context }) => (
    { 
        Authorization: 'Bearer token',
        'x-api-key': context.something
    }
  ),
  fetch: (request, init, _options, _path, _input) => {
    return globalThis.fetch(request, {
      ...init,
      credentials: 'include', // Include cookies for cross-origin requests
    })
  },
  interceptors: [
    onError((error) => {
      console.error(error)
    })
  ],
  plugins: [
     new SimpleCsrfProtectionLinkPlugin(),
  ]
})

export const orpcFetch: UserAppRouter = createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcFetch);

