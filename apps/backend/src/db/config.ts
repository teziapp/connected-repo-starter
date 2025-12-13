import { env, isProd } from "@backend/configs/env.config";

export const dbConfig = {
	host: env.DB_HOST,
	port: Number(env.DB_PORT),
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,
	ssl: isProd,
};
