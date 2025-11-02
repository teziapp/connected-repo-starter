import { ErrorFallback } from "@frontend/components/error_fallback";
import { authLoader } from "@frontend/utils/auth.loader";
import { lazy } from "react";
import { createBrowserRouter, Outlet, redirect, type RouteObject } from "react-router";

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
				loader: () => redirect("/dashboard"),
			},
			{
				path: "auth/*",
				Component: lazy(() => import("@frontend/modules/auth/auth.router")),
			},
			{
				path: "dashboard",
				Component: lazy(() => import("@frontend/pages/Dashboard.page")),
				loader: authLoader,
			},
			{
				path: "demo",
				Component: lazy(() => import("@frontend/pages/DatabaseDemo")),
				loader: authLoader,
			},
		],
	},
];

export const router = createBrowserRouter(routerObjectWithNavbar);
