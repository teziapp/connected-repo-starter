import { env } from "../configs/env.config";

export const dbConfig = {
	host: env.DB_HOST || "localhost",
	port: Number(env.DB_PORT) || 5432,
	user: env.DB_USER || "postgres", 
	password: env.DB_PASSWORD || "password",
	database: env.DB_NAME || "connected_repo_db",
	ssl: env.VITE_NODE_ENV === "production",
};