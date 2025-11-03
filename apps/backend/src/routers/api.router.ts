import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import {
	type FastifyZodOpenApiSchema,
	type FastifyZodOpenApiTypeProvider,
	fastifyZodOpenApiPlugin,
	fastifyZodOpenApiTransform,
	fastifyZodOpenApiTransformObject,
	serializerCompiler,
	validatorCompiler,
} from "fastify-zod-openapi";
import z from "zod";

export const apiRouter = async (app: FastifyInstance) => {

	// Set Zod validator and serializer for OpenAPI compatibility
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	// Register OpenAPI plugin for this router only
	await app.register(fastifyZodOpenApiPlugin);

	// Register Swagger with OpenAPI 3.1.0 spec
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
	await app.register(swaggerUI, {
		routePrefix: "/api/documentation",
	});

	// API routes
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
};