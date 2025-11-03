import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import z from "zod";

export const apiRouter = (app: FastifyInstance) => {
	/**
	 * GET /api - Health check / root endpoint
	 *
	 * Returns a simple message to verify the API is running.
	 * This endpoint appears in Swagger UI with full schema documentation.
	 */
	app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
		method: "GET",
		url: "/",
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
