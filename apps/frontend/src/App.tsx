/*
 * Copyright (c) 2025 Tezi Communnications LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { ThemeProvider } from "@connected-repo/ui-mui/theme/ThemeProvider";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider } from "react-router";
import { ErrorFallback } from "@frontend/components/error_fallback";
import { router } from "@frontend/router";

// App focuses on rendering the router tree and error boundaries. Providers
// (QueryClient + tRPC client) are created and mounted at the root in
// `main.tsx` following the tRPC + TanStack React Query recommended setup.
function App() {
	return (
		<ThemeProvider>
			<Suspense fallback={<LoadingSpinner text="Loading..." />}>
				<ErrorBoundary fallback={<ErrorFallback />}>
					<RouterProvider router={router} />
				</ErrorBoundary>
			</Suspense>
		</ThemeProvider>
	);
}

export default App;
