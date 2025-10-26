import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppTrpcRouter } from "../../../server/src/router.trpc";
import { env } from "../configs/env.config";
import { queryClient } from './queryClient';


// Create tRPC client factory. We keep the TRPC React wrapper in a separate
// module so components can import `trpc` for hooks, and main can create the
// concrete client instance used by the provider.
const trpcClient = createTRPCClient<AppTrpcRouter>({
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
  client: trpcClient,
  queryClient,
});

