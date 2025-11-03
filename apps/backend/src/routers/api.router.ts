/**
 * @example Adding new OpenAPI routes:
 *
 * // 1. Create Zod schema in packages/zod-schemas/src/
 * export const userResponseZod = z.object({
 *   userId: z.uuid().meta({ description: "User ID" }),
 *   name: z.string().meta({ description: "User name", example: "John Doe" }),
 * });
 *
 * // 2. Import and use in router with .withTypeProvider()
 * app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
 *   method: "GET",
 *   url: "/users/:id",
 *   schema: {
 *     params: z.object({ id: z.uuid() }),
 *     response: {
 *       200: userResponseZod,
 *     },
 *   } satisfies FastifyZodOpenApiSchema,
 *   handler: async (req, reply) => {
 *     // Your handler logic
 *   },
 * });
 */
import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import z from "zod";

// ============================================================
// API Routes
// ============================================================
// All routes defined below will automatically appear in OpenAPI spec
// Use .withTypeProvider<FastifyZodOpenApiTypeProvider>() for type safety
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
