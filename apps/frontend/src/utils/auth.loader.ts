import { queryClient } from "@frontend/utils/queryClient";
import { trpc } from "@frontend/utils/trpc.client";
import { redirect } from "react-router";

/**
 * Auth loader for protected routes
 * Checks session and redirects based on auth state
 */
export async function authLoader() {
	try {
		// Fetch session info from backend
		const sessionInfo = await queryClient.fetchQuery(
			trpc.auth.getSessionInfo.queryOptions()
		);

		// No session - redirect to login
		if (!sessionInfo.hasSession) {
			return redirect("/auth/login");
		}

		// Session exists but not registered - redirect to register
		if (!sessionInfo.isRegistered) {
			return redirect("/auth/register");
		}

		// Authenticated and registered - return session data
		return sessionInfo;
	} catch (error) {
		console.error("Auth loader error:", error);
		return redirect("/auth/login");
	}
}

/**
 * Guest loader for auth pages (login, register)
 * Redirects to dashboard if already authenticated
 */
export async function guestLoader() {
	try {
		// Fetch session info from backend
		const sessionInfo = await queryClient.fetchQuery(
			trpc.auth.getSessionInfo.queryOptions()
		);

		// Already registered - redirect to dashboard
		if (sessionInfo.hasSession && sessionInfo.isRegistered) {
			return redirect("/dashboard");
		}

		// Not registered or no session - allow access to page
		return sessionInfo;
	} catch (error) {
		console.error("Guest loader error:", error);
		return null;
	}
}
