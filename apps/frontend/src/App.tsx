/*
 * Copyright (c) 2025 Tezi Communnications LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider } from "react-router";
import ThemeProvider from "../../../packages/ui-mui/dist/theme/ThemeProvider";
import { ErrorFallback } from "./components/error_fallback";
import { Spinner } from "./components/spinner";
import { router } from "./router";

// App focuses on rendering the router tree and error boundaries. Providers
// (QueryClient + tRPC client) are created and mounted at the root in
// `main.tsx` following the tRPC + TanStack React Query recommended setup.
function App() {
	return (
		<ThemeProvider>
			<Suspense fallback={<Spinner />}>
				<ErrorBoundary fallback={<ErrorFallback />}>
					<RouterProvider router={router} />
				</ErrorBoundary>
			</Suspense>
		</ThemeProvider>
	);
}

export default App;
