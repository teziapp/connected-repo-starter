import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "./pages/Login.page";
import { RegisterPage } from "./pages/Register.page";

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
