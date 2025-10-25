import type { NODE_ENV } from "@connected-repo/zod-schemas/node-env";
import type { FastifyBaseLogger, FastifyHttpOptions } from "fastify";
import type { Server } from "node:https";

export const loggerConfig: Record<NODE_ENV, FastifyHttpOptions<Server, FastifyBaseLogger>["logger"]> = {
	development: {
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
	production: {
		level: "info",
		transport: {
			targets: [
				{
					target: "@axiomhq/pino",
					options: {
						translateTime: "HH:MM:ss Z",
						ignore: "pid,hostname",
						// if axiom is enabled, we will send the logs to axiom
						...(process.env.AXIOM_DATASET && process.env.AXIOM_TOKEN
							? {
									dataset: process.env.AXIOM_DATASET,
									token: process.env.AXIOM_TOKEN,
								}
							: {}),
					},
				},
			],
		},
	},
	staging: { level: "info" },
	test: {
		level: "fatal",
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
};
