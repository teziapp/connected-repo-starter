/*
 * Copyright (c) 2025 Tezi Communications LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { env, isDev, isProd } from "@backend/configs/env.config";
import { loggerConfig } from "@backend/configs/logger.config";
import { db } from "@backend/db/db";
import { registerErrorHandler } from "@backend/middlewares/errorHandler";
import { DatabaseSessionStore } from "@backend/modules/auth/session.auth.store";
import { appRouter } from "@backend/routers/app.router";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import session from "@fastify/session";
import fastify from "fastify";

export const app = fastify({
	logger: loggerConfig[env.NODE_ENV],
	maxParamLength: 5000,
});
export const logger = app.log;

// Register cookie support for sessions
app.register(cookie);

// Global rate limiting (generous limits to prevent DoS)
// Uses in-memory storage (upgrade to Redis for production with multiple servers)
app.register(rateLimit, {
	global: true,
	max: 200, // 200 requests
	timeWindow: 1000 * 60, // per minute per IP
	cache: 10000, // Keep 10k IPs in memory
	allowList: isDev ? ["127.0.0.1", "::1", "localhost"] : undefined, // Skip rate limit in dev for localhost
	errorResponseBuilder: () => ({
		statusCode: 429,
		error: "Too Many Requests",
		message: "Rate limit exceeded. Please try again later.",
	}),
});

// Register rate-limited not-found handler as a plugin (runs after rate limit is ready)
// This prevents malicious 404 scanning attacks with stricter rate limiting
app.register(async (instance) => {
	instance.setNotFoundHandler(
		{
			preHandler: instance.rateLimit({
				max: 10, // 10 requests
				timeWindow: 1000 * 60, // per minute per IP (stricter than global)
			}),
		},
		function (_request, reply) {
			reply.code(404).send({
				status: "error",
				message: `Route ${_request.method}:${_request.url} not found`,
				errorCode: "NOT_FOUND",
			});
		},
	);
});

// Session configuration
export const cookieMaxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

// Create database session store
const sessionStore = new DatabaseSessionStore(db, cookieMaxAge);

// Register session management with database-backed storage
app.register(session, {
	secret: env.SESSION_SECRET,
	store: sessionStore,
	cookie: {
		secure: isProd, // true in production (HTTPS), false in development (HTTP)
		httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
		maxAge: cookieMaxAge, // Cookie expiration time
		sameSite: "lax", // Provides some CSRF protection
		path: "/", // Cookie available for all paths
		// IMPORTANT: For cross-port localhost communication (dev: :3000 ↔ :5173)
		// we need domain=localhost and sameSite=lax
		domain: isDev ? "localhost" : undefined, // Allow cross-port in dev
	},
});

// Configure custom not-found handler with stricter rate limiting
// This prevents malicious 404 scanning attacks
app.setNotFoundHandler(
	{
		preHandler: app.rateLimit({
			max: 10, // 10 requests
			timeWindow: 1000 * 60, // per minute per IP (stricter than global)
		}),
	},
	function (_request, reply) {
		reply.code(404).send({
			statusCode: 404,
			error: "Not Found",
			message: "Route not found",
		});
	},
);

// Register OAuth2 module (all OAuth2 providers + routes)
app.register(appRouter);

// Register central error handler
registerErrorHandler(app);
