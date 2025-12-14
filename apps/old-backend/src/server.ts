/*
 * Copyright (c) 2025 Tezi Communnications LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import "dotenv/config";

import { app, logger } from "@backend/app";
import { env, isDev, isProd, isStaging, isTest } from "@backend/configs/env.config";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

// Extend allowed origins with Capacitor/Ionic local origins
const allowedOrigins = [...(env.ALLOWED_ORIGINS?.split(",") || [])];

logger.info({ isDev, isProd, isStaging, isTest }, "Environment:");
logger.info(allowedOrigins, "Allowed Origins:");
logger.info(env.ALLOWED_ORIGINS, "ALLOWED_ORIGINS env:");

export const build = async () => {
	const server = app;

	// Global CORS configuration
	// Note: /api/* routes use team-specific CORS validation (see api-gateway.router.ts)
	// This global CORS applies to other routes like /trpc, /oauth2, /, /health
	//
	// IMPORTANT: We allow all origins at the CORS plugin level for /api/* routes,
	// and let the corsValidationHook middleware (which runs after routing) handle
	// team-specific validation. This prevents the global CORS from rejecting requests
	// before they reach the team-specific validation.
	await server.register(cors, {
		origin: true, // Accept all origins - route-specific middleware will validate
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	});

	// Add validation hook for non-/api routes to enforce ALLOWED_ORIGINS
	// /api/* routes are validated by team-specific corsValidationHook
	server.addHook("onRequest", async (request, reply) => {
		// Skip CORS validation for /api/* routes - they use team-specific validation
		if (request.url.startsWith("/api/")) {
			return;
		}

		// For other routes, validate against ALLOWED_ORIGINS (in production)
		if (!isDev) {
			const origin = request.headers.origin;

			// If there's an origin header, validate it
			if (origin && !allowedOrigins.includes(origin)) {
				reply.code(403).send({
					statusCode: 403,
					error: "Forbidden",
					message: "Origin not allowed by CORS policy",
				});
			}
		}
	});

	// Helmet for security headers
	server.register(helmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				connectSrc: ["'self'"], // Allow tRPC/API requests
				scriptSrc: ["'self'"],
				imgSrc: ["'self'"],
			},
		},
		xFrameOptions: { action: "sameorigin" },
		referrerPolicy: { policy: "origin" },
	});

	return server;
};

const start = async () => {
	try {
		const server = await build();
		await server.listen({ port: 3000, host: "0.0.0.0" });
		if (process.send) {
			process.send("ready"); // ✅ Let PM2 know the app is ready
		}
		logger.info({ url: "http://localhost:3000" }, "Server running");
	} catch (err) {
		logger.error("Server failed to start");
		logger.error(err);
		process.exit(1);
	}
};

// Only auto-start in non-test environments
if (!isTest) {
	start();
}
