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

import { apiGatewayRouter } from "@backend/modules/api-gateway/api-gateway.router";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import {
	fastifyZodOpenApiPlugin,
	FastifyZodOpenApiSchema,
	fastifyZodOpenApiTransform,
	fastifyZodOpenApiTransformObject,
	FastifyZodOpenApiTypeProvider,
	serializerCompiler,
	validatorCompiler
} from "fastify-zod-openapi";
import z from "zod";

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
			components: {
				securitySchemes: {
					ApiKeyAuth: {
						type: "apiKey",
						in: "header",
						name: "x-api-key",
					},
					TeamIdHeader: {
						type: "apiKey",
						in: "header",
						name: "x-team-id",
					},
				},
			},
			security: [{ ApiKeyAuth: [], TeamIdHeader: [] }],
		},
		transform: fastifyZodOpenApiTransform,
		transformObject: fastifyZodOpenApiTransformObject,
	});

	// Register Swagger UI for interactive documentation
	// Access at: http://localhost:3000/api/documentation
	await app.register(swaggerUI, {
		routePrefix: "/api/documentation",
	});
	/**
	 * GET /api - Health check / root endpoint
	 *
	 * Returns a simple message to verify the API is running.
	 * This endpoint appears in Swagger UI with full schema documentation.
	 */
	app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
		method: "GET",
		url: "/api",
		schema: {
			response: {
				200: z.object({
					message: z.string().meta({
						description: "Response message from the API",
						example: "Hello from API",
					}),
				})
			},
		} satisfies FastifyZodOpenApiSchema,
		handler: async (_req, reply) => {
			app.log.info("API root endpoint hit api.router.ts");
			return reply.send({ message: "Hello from API" });
		},
	});

	// Register API Gateway router
	app.register(apiGatewayRouter, {
		prefix: "/api",
	});
};