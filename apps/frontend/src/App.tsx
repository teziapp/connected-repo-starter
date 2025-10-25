/*
* Copyright (c) 2025 Tezi Communnications LLP, India
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*/
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, httpBatchStreamLink } from "@trpc/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider } from "react-router";
import type { AppTrpcRouter } from "../../server/src/router.trpc";
import { ErrorFallback } from "./components/error_fallback";
import { Spinner } from "./components/spinner";
import { env } from "./configs/env.config";
import { router } from "./router";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
		},
	},
});

export const trpc = createTRPCReact<AppTrpcRouter>();

function App() {
	const trpcClient = trpc.createClient({
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

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<Suspense fallback={<Spinner />}>
					<ErrorBoundary fallback={<ErrorFallback />}>
						<RouterProvider router={router} />
					</ErrorBoundary>
				</Suspense>
			</QueryClientProvider>
		</trpc.Provider>
	);
}

export default App;
