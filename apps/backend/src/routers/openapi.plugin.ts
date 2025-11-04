/**
 * OpenAPI-compliant REST API Router
 *
 * This router provides RESTful endpoints with automatic OpenAPI/Swagger documentation.
 * Uses Zod schemas for type-safe validation and automatic spec generation.
 *
 * Endpoints:
 * - API: http://localhost:3000/api/
 * - OpenAPI Spec: http://localhost:3000/api/documentation/json
 * - Swagger UI: http://localhost:3000/api/documentation
 */

import { apiRouter } from "@backend/routers/api.router";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import {
	fastifyZodOpenApiPlugin,
	fastifyZodOpenApiTransform,
	fastifyZodOpenApiTransformObject,
	serializerCompiler,
	validatorCompiler
} from "fastify-zod-openapi";

export const openapiPlugin = async (app: FastifyInstance) => {

	// Set Zod validator and serializer for OpenAPI compatibility
	// This enables automatic validation and serialization based on Zod schemas
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	// Register OpenAPI plugin for this router only
	// Enables OpenAPI schema generation from Zod schemas
	await app.register(fastifyZodOpenApiPlugin);

	// Register Swagger with OpenAPI 3.1.0 spec
	// Generates OpenAPI documentation available at /api/documentation/json
	await app.register(swagger, {
		openapi: {
			info: {
				title: "Connected Repo REST API",
				description: "REST API documentation for /api routes only",
				version: "1.0.0",
			},
			servers: [
				{
					url: "http://localhost:3000/api",
					description: "Development server",
				},
			],
		},
		transform: fastifyZodOpenApiTransform,
		transformObject: fastifyZodOpenApiTransformObject,
	});

	// Register Swagger UI for interactive documentation
	// Access at: http://localhost:3000/api/documentation
	await app.register(swaggerUI, {
		routePrefix: "/api/documentation",
	});
	
  app.register(apiRouter, {
    prefix: "/api",
  });
};