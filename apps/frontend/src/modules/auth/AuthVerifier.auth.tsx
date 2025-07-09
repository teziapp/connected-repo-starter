import { Navigate } from "react-router";

export const AuthVerifier = () => {
	const user = localStorage.getItem("user");
	if (user) {
		return null;
	}
	return <Navigate to="/auth/login" />;
};
