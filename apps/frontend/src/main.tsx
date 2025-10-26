/*
 * Copyright (c) 2025 Tezi Communnications LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { queryClient } from "./utils/queryClient";

// Defensive mounting: ensure the root element exists and create the root
// only once. This pattern is compatible with React 18/19 root API and is
// resilient for incremental upgrades and hydration strategies.
const container = document.getElementById("root");
if (!container) {
	throw new Error("Root element with id \"root\" not found");
}

const root = createRoot(container);

root.render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
				<App />
		</QueryClientProvider>
	</StrictMode>,
);
