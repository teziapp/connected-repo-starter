import { UserSelectAll } from "@connected-repo/zod-schemas/user.zod";
import { createContext, useOutletContext } from "react-router";

export interface SessionInfo {
	hasSession: boolean;
	user: UserSelectAll | null;
	isRegistered: boolean;
}

/**
 * React Router context for user session data
 * Set by authLoader before components render
 * Used for loader-to-loader context sharing
 */
export const userContext = createContext<SessionInfo | null>(null);

/**
 * Hook to access session data in components
 * Session data is provided by AppLayout via Outlet context
 *
 * @returns SessionInfo object with user data and session state
 * @throws Error if used outside of authenticated routes
 */
export function useSessionInfo(): SessionInfo {
	const sessionInfo = useOutletContext<SessionInfo>();
	if (!sessionInfo) {
		throw new Error("useSessionInfo must be used within authenticated routes (under AppLayout)");
	}
	return sessionInfo;
}
