import { userContext } from "@frontend/contexts/UserContext";
import { authClient } from "@frontend/utils/auth.client";
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
		// Fetch session from better-auth client
		const { data: session, error } = await authClient.getSession();

		if (error || !session) {
			throw redirect("/auth/login");
		}

		const sessionInfo = {
			hasSession: true,
			user: {
				email: session.user.email,
				name: session.user.name,
				displayPicture: session.user.image,
			},
			isRegistered: true, // better-auth handles registration
		};

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
		// Fetch session from better-auth client
		const { data: session, error } = await authClient.getSession();

		if (!error && session) {
			return redirect("/dashboard");
		}

		// No session - allow access to page
		return null;
	} catch (error) {
		console.error("Guest loader error:", error);
		return null;
	}
}
