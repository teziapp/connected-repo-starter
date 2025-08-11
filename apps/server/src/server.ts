import "dotenv/config";

// Only import in production environment
if (process.env.NODE_ENV === "development") {
  require("../opentelemetry");
}
  
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { BurstyRateLimiter, RateLimiterMemory } from "rate-limiter-flexible";
import { app, logger , db } from "./app";
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
  })
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
    await initDatabase();
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

async function initDatabase() {
  try {
    await db.$query`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    await db.$query`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("Database tables created successfully!");

    // Create sample data
    const existingUsers = await db.user.count();
    if (existingUsers === 0) {
      const user = await db.user.create({
        name: "John Doe",
        email: "john@example.com",
      });

      await db.post.create({
        title: "My First Post",
        body: "Hello world from Orchid ORM!",
        userId: user.id,
      });

      console.log("Sample data created!");
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}
