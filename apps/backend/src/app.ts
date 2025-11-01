/*
 * Copyright (c) 2025 Tezi Communications LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { env } from "@backend/configs/env.config";
import { loggerConfig } from "@backend/configs/logger.config";
import { db } from "@backend/db/db";
import { registerErrorHandler } from "@backend/middlewares/errorHandler";
import { oauth2Plugin } from "@backend/modules/auth/oauth2/oauth2.auth.plugin";
import { DatabaseSessionStore } from "@backend/modules/auth/session.auth.store";
import { appTrpcRouter } from "@backend/router.trpc";
import { createTRPCContext, type TrpcContext } from "@backend/trpc";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";

export const app = fastify({
	logger: loggerConfig[env.NODE_ENV],
	maxParamLength: 5000,
});
export const logger = app.log;

// Register cookie support for sessions
app.register(cookie);

// Create database session store
const sessionStore = new DatabaseSessionStore(db);

export const cookieMaxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

// Register session management with database-backed storage
app.register(session, {
	secret: env.SESSION_SECRET,
	store: sessionStore,
	cookie: {
		secure: env.NODE_ENV === "production", // Only send cookie over HTTPS in production
		httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
		maxAge: cookieMaxAge, // Cookie expiration time
		sameSite: "lax", // Provides some CSRF protection
	},
});

// Register OAuth2 module (all OAuth2 providers + routes)
app.register(oauth2Plugin, {
	prefix: "/oauth2"
});

// Define a simple route with Zod validation
app.get(
	"/",
	{
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						message: { type: "string" },
					},
					required: ["message"],
				},
			},
		},
	},
	async () => {
		app.log.info("Hello API endpoint hit app.log.info");
		return { message: "Hello API" };
	},
);

app.register(fastifyTRPCPlugin, {
	prefix: "/trpc",
	trpcOptions: {
		router: appTrpcRouter,
		createContext: createTRPCContext,
		/**
		 * tRPC error logger for Fastify
		 */
		onError({
			error,
			path,
			type,
			ctx,
			input,
		}: {
			error: Error;
			path?: string;
			type?: string;
			ctx?: TrpcContext;
			input?: unknown;
		}) {
			app.log.error(
				{
					error: error.message,
					stack: error.stack,
					path,
					type,
					input,
					userId: ctx?.userId,
				},
				"tRPC error",
			);
		},
	},
});

// Register central error handler
registerErrorHandler(app);
