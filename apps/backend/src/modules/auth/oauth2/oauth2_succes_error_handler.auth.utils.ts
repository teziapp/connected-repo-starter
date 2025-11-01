import { env } from "@backend/configs/env.config";
import { SessionUser, setSession } from "@backend/modules/auth/session.utils";
import type { FastifyReply, FastifyRequest } from "fastify";

export const oauth2SuccessHandler = (
	request: FastifyRequest, reply: FastifyReply, userInfo: SessionUser
) => {

	setSession(request, userInfo);

	// Redirect to frontend app
	return reply.redirect(`${env.WEBAPP_URL}/auth/success`);
}

export const oauth2ErrorHandler = (
	reply: FastifyReply,
	errorType = "oauth_failed",
) => {
	return reply.redirect(`${env.WEBAPP_URL}/login?error=${errorType}`);
}