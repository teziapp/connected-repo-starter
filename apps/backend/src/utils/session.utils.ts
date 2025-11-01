import type { FastifyRequest } from "fastify";
/**
 * User info stored in session
 */
export interface SessionUser {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

/**
 * Augment Fastify types to include session
 */
declare module "fastify" {

	interface Session {
		user?: SessionUser;
	}
}

export const setSession = (
	request: FastifyRequest,
	userInfo: SessionUser,
) => {
	// Store user info in session (works with any OAuth provider)
	request.session.user = {
		id: userInfo.id,
		email: userInfo.email,
		name: userInfo.name,
		picture: userInfo.picture,
	};
}

export function clearSession(request: FastifyRequest) {
	request.session.destroy();
}
