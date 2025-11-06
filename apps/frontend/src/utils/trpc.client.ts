import type { AppTrpcRouter } from "@backend/routers/trpc.router";
import { env } from "@frontend/configs/env.config";
import { queryClient } from '@frontend/utils/queryClient';
import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';


// Create tRPC client factory. We keep the TRPC React wrapper in a separate
// module so components can import `trpc` for hooks, and main can create the
// concrete client instance used by the provider.
export const trpcFetch = createTRPCClient<AppTrpcRouter>({
  links: [
      httpBatchStreamLink({
          url: `${env.VITE_API_URL}/trpc`,
          fetch(url, options) {
              return fetch(url, {
                  ...options,
                  credentials: "include",
              });
          },
          headers() {
              return {
                  "x-user-id": "123",
              };
          },
      }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppTrpcRouter>({
  client: trpcFetch,
  queryClient,
});

