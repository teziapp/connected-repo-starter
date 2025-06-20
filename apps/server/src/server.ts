// Only import in production environment
if (process.env.NODE_ENV === "production") {
	require("./opentelemetry");
}

import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { BurstyRateLimiter, RateLimiterMemory } from "rate-limiter-flexible";
import { app, logger } from "./app";
import { env, isDev, isProd, isStaging, isTest } from "./configs/env.config";

// Create global rate limiter
const globalRateLimiter = new BurstyRateLimiter(
	new RateLimiterMemory({
		points: 2, // 2 requests
		duration: 1, // per second
	}),
	new RateLimiterMemory({
		keyPrefix: "burst",
		points: 5, // 5 requests
		duration: 10, // per 10 seconds
	}),
);

// Extend allowed origins with Capacitor/Ionic local origins
const allowedOrigins = [
	...(env.ALLOWED_ORIGINS?.split(",") || []),
	"http://localhost",
];

logger.info({ isProd, isStaging, isTest }, "Environment:");
logger.info(allowedOrigins, "Allowed Origins:");
logger.info(env.ALLOWED_ORIGINS, "ALLOWED_ORIGINS env:");

export const build = async () => {
	const server = app;

	// Global rate limiting hook
	if ((isProd || isStaging) && globalRateLimiter) {
		server.addHook("preHandler", async (req, reply) => {
			try {
				await globalRateLimiter.consume(req.ip);
			} catch (_err) {
				reply.code(429).send({
					error: "Too Many Requests please try again later.",
				});
			}
		});
	}

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
		logger.info("Server running", { url: "http://localhost:3000" });
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
