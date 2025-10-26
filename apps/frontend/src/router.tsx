import { lazy } from "react";
import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { ErrorFallback } from "./components/error_fallback";
import { DatabaseDemo } from "./pages/DatabaseDemo";

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
				lazy: async () => {
					const AuthRouter = lazy(() => import("./modules/auth/auth.router"));
					return { Component: AuthRouter };
				},
			},
			{
				path: "demo",
				element: <DatabaseDemo />,
			},
		],
	},
];

export const router = createBrowserRouter(routerObjectWithNavbar);
