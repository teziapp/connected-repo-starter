import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { env } from "./configs/env.config";
import { loggerConfig } from "./configs/logger.config";
import { registerErrorHandler } from "./middlewares/errorHandler";
import { appTrpcRouter } from "./router.trpc";
import { createTRPCContext, type TrpcContext } from "./trpc";
import * as tracker from '@middleware.io/node-apm';


import { orchidORM, createBaseTable } from "orchid-orm";

// Base table setup
const BaseTable = createBaseTable();

console.log("Process PID", process.pid)

// User table definition
class UserTable extends BaseTable {
  table = "users";

  columns = this.setColumns((t) => ({
	id: t.identity().primaryKey(),
	name: t.string(),
	email: t.string().unique(),
	...t.timestamps(),
  }));

  relations = {
	posts: this.hasMany(() => PostTable, {
	  columns: ["id"],
	  references: ["userId"],
	}),
  };
}

// Post table definition
class PostTable extends BaseTable {
  table = "posts";

  columns = this.setColumns((t) => ({
	id: t.identity().primaryKey(),
	title: t.string(),
	body: t.text(),
	userId: t.integer().foreignKey(() => UserTable, "id"),
	...t.timestamps(),
  }));

  relations = {
	author: this.belongsTo(() => UserTable, {
	  columns: ["userId"],
	  references: ["id"],
	}),
  };
}

// Database configuration
export const db = orchidORM(
  {
	databaseURL: "postgresql://user:password@localhost:5432/mydb",
	log: true,
  },
  {
	user: UserTable,
	post: PostTable,
  }
);

export const app = fastify({
	logger: loggerConfig[env.NODE_ENV],
	maxParamLength: 5000,
});
export const logger = app.log;

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
		const users = await db.user.select("id", "name", "email");
		console.log("🚀 ~ users:", users)
		return { message: "Hello API" };
	},
);

app.get(
	"/error",
	{
		schema: {
			response: {
				500: {
					type: "object",
					properties: {
						message: { type: "string" },
					},
					required: ["message"]
				}
			}
		}
	}, () => {
		const err = new Error("this is constructed error message")
		throw new Error(err.message)
		return { message: err.message }
	}
)

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

app.setErrorHandler((error, request) => {
  tracker.error(error.message, {
    method: request.method,
    url: request.url,
    headers: request.headers,
    body: request.body
  });
})

// Register central error handler
// registerErrorHandler(app);
