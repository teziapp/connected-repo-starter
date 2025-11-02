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

	await server.register(cors, {
		origin: (origin, cb) => {
			if (isDev) {
				cb(null, true);
				return;
			}
			if (!origin || allowedOrigins.includes(origin)) {
				cb(null, true);
				return;
			}
			cb(new Error("Not allowed by CORS"), false);
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
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
