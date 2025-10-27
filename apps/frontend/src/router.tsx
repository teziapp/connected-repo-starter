import { lazy } from "react";
import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { ErrorFallback } from "@frontend/components/error_fallback";

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
				path: "demo",
				// FIXME: This is not working. Need to investigate why.
				lazy: async () => {
					const DatabaseDemo = lazy(() => import("@frontend/pages/DatabaseDemo"));
					return { Component: DatabaseDemo };
				},
			},
		],
	},
];

export const router = createBrowserRouter(routerObjectWithNavbar);
