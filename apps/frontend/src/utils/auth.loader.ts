import { userContext } from "@frontend/contexts/UserContext";
import { orpc } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Auth loader for protected routes
 * Fetches session, sets React Router context, and redirects based on auth state
 */
export async function authLoader({ context }: LoaderFunctionArgs) {
	try {
		// Fetch session info from backend
		const sessionInfo = await queryClient.fetchQuery(
			orpc.auth.getSessionInfo.queryOptions()
		);

		// No session - redirect to login
		if (!sessionInfo.hasSession) {
			throw redirect("/auth/login");
		}

		// Session exists but not registered - redirect to register
		if (!sessionInfo.isRegistered) {
			throw redirect("/auth/register");
		}

		// Set user context in React Router context
		context.set(userContext, sessionInfo);

		// Return session data for loader
		return sessionInfo;

	} catch (error) {
		console.error("Auth loader error:", error);
		throw redirect("/auth/login");
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
			orpc.auth.getSessionInfo.queryOptions()
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
