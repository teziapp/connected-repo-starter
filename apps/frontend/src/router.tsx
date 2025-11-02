import { ErrorFallback } from "@frontend/components/error_fallback";
import { AppLayout } from "@frontend/components/layout/AppLayout";
import { authLoader } from "@frontend/utils/auth.loader";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { lazy } from "react";
import { createBrowserRouter, Outlet, redirect, type RouteObject } from "react-router";

type NavbarFields = {
	nb_icon?: string;
};

type BaseRouterWithNavbar = RouteObject & NavbarFields;
export type ReactRouterWithNavbar = BaseRouterWithNavbar & {
	children?: ReactRouterWithNavbar[];
};

// HydrateFallback component for initial app loading
const HydrateFallback = () => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			minHeight: "100vh",
			bgcolor: "background.default",
		}}
	>
		<CircularProgress size={48} />
	</Box>
);

export const routerObjectWithNavbar: ReactRouterWithNavbar[] = [
	{
		path: "/",
		errorElement: <ErrorFallback />,
		hydrateFallbackElement: <HydrateFallback />,
		element: <Outlet />,
		children: [
			{
				index: true,
				loader: () => redirect("/dashboard"),
			},
			{
				path: "auth/*",
				Component: lazy(() => import("@frontend/modules/auth/auth.router")),
			},
			// Authenticated routes with AppLayout
			{
				element: <AppLayout />,
				loader: authLoader,
				children: [
					{
						path: "dashboard",
						Component: lazy(() => import("@frontend/pages/Dashboard.page")),
					},
					{
						path: "demo",
						Component: lazy(() => import("@frontend/pages/DatabaseDemo")),
					},
					{
						path: "posts",
						Component: lazy(() => import("@frontend/pages/Dashboard.page")), // TODO: Create Posts page
					},
					{
						path: "posts/new",
						Component: lazy(() => import("@frontend/pages/Dashboard.page")), // TODO: Create CreatePost page
					},
					{
						path: "profile",
						Component: lazy(() => import("@frontend/pages/Dashboard.page")), // TODO: Create Profile page
					},
				],
			},
		],
	},
];

export const router = createBrowserRouter(routerObjectWithNavbar);
