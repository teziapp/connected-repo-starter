import { ErrorFallback } from "@frontend/components/error_fallback";
import { lazy } from "react";
import { createBrowserRouter, Outlet, type RouteObject } from "react-router";

type NavbarFields = {
	nb_icon?: string;
};

type BaseRouterWithNavbar = RouteObject & NavbarFields;
export type ReactRouterWithNavbar = BaseRouterWithNavbar & {
	children?: ReactRouterWithNavbar[];
};

export const routerObjectWithNavbar: ReactRouterWithNavbar[] = [
	{
		path: "/",
		errorElement: <ErrorFallback />,
		element: <Outlet />,
		children: [
			{
				index: true,
				// element: <AuthVerifier />,
			},
			{
				path: "auth/*",
				Component: lazy(() => import("@frontend/modules/auth/auth.router")),
			},
			{
				path: "dashboard",
				Component: lazy(() => import("@frontend/pages/Dashboard.page")),
			},
			{
				path: "demo",
				// FIXME: This is not working. Need to investigate why.
				lazy: async () => {
					const DatabaseDemo = await import("@frontend/pages/DatabaseDemo");
					return { Component: DatabaseDemo };
				},
			},
		],
	},
];

export const router = createBrowserRouter(routerObjectWithNavbar);
