import { Navigate } from "react-router";
import type { ReactRouterWithNavbar } from "../../router";

export const authRouter: ReactRouterWithNavbar[] = [
	{
		index: true,
		element: <Navigate to="login" />,
	},
	{
		path: "login",
		lazy: async () => {
			const { LoginPage } = await import("./pages/Login.page");
			return {
				element: <LoginPage />,
			};
		},
	},
	{
		path: "register",
		lazy: async () => {
			const { RegisterPage } = await import("./pages/Register.page");
			return {
				element: <RegisterPage />,
			};
		},
	},
];
