import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "@frontend/modules/auth/pages/Login.page";
import { RegisterPage } from "@frontend/modules/auth/pages/Register.page";

const AuthRouter = () => {
	return (
		<Routes>
			<Route path="/">
				<Route index element={<Navigate to="/auth/login" />} />
				<Route path="login" element={<LoginPage />} />
				<Route path="register" element={<RegisterPage />} />
			</Route>
		</Routes>
	);
};

export default AuthRouter;
