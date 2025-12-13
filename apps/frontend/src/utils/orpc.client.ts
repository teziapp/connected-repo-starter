import { env } from "@frontend/configs/env.config";
import { createORPCClient, onError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { SimpleCsrfProtectionLinkPlugin } from '@orpc/client/plugins';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { BackendRouter } from "../../../backend/src/router";

interface ClientContext {
  something?: string
}

const link = new RPCLink<ClientContext>({
  url: env.VITE_API_URL,
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

export const orpcFetch: BackendRouter = createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcFetch);

