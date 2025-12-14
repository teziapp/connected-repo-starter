import { LoginPage } from "@frontend/modules/auth/pages/Login.page";
import { Navigate, Route, Routes } from "react-router";

const AuthRouter = () => {
	return (
		<Routes>
			<Route path="/">
				<Route index element={<Navigate to="/auth/login" />} />
				<Route path="login" element={<LoginPage />} />
			</Route>
		</Routes>
	);
};

export default AuthRouter;
