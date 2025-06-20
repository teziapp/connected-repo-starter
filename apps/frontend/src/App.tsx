import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, httpBatchStreamLink } from "@trpc/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { AppTrpcRouter } from "../../server/src/router.trpc";
import { ErrorFallback } from "./components/error_fallback";
import { Spinner } from "./components/spinner";
import { env } from "./configs/env.config";
import { HelloWorld } from "./pages/hello_world";

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
						<HelloWorld />
					</ErrorBoundary>
				</Suspense>
			</QueryClientProvider>
		</trpc.Provider>
	);
}

export default App;
