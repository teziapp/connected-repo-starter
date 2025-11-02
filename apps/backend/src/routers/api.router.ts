import type { FastifyInstance } from "fastify";

export const apiRouter = (app: FastifyInstance) => {
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
      app.log.info("API root endpoint hit api.router.ts");
      return { message: "Hello from API" };
    },
  );
}