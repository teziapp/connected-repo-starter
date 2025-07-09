import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { AuthVerifier } from "./modules/auth/AuthVerifier.auth";

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
		errorElement: <div>Error</div>,
		element: <Outlet />,
		children: [
			{
				index: true,
				element: <AuthVerifier />,
			},
			{
				path: "auth",
				lazy: async () => {
					const { authRouter } = await import("./modules/auth/auth.router");
					return { children: authRouter };
				},
			},
		],
	},
];

export const router = createBrowserRouter(routerObjectWithNavbar);
