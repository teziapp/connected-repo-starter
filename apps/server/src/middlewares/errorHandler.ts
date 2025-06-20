import { TRPCError } from "@trpc/server";
import type {
	FastifyError,
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import { ZodError } from "zod";
import { isDev } from "../configs/env.config";

// Custom API error class
export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;
	errorCode?: string;

	constructor(message: string, statusCode: number, errorCode?: string) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true; // This is a known operational error
		this.errorCode = errorCode;

		Error.captureStackTrace(this, this.constructor);
	}
}

// Handle errors based on their type
export const handleError = (
	error: Error | FastifyError | ZodError | TRPCError | AppError,
	_req: FastifyRequest,
	reply: FastifyReply,
) => {
	// Default error response structure
	const errorResponse = {
		status: "error",
		message: error.message || "Something went wrong",
		errorCode: "INTERNAL_SERVER_ERROR",
		stack: isDev ? error.stack : undefined,
	};

	// Handle custom AppError
	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			...errorResponse,
			message: error.message,
			errorCode: error.errorCode || `HTTP_${error.statusCode}`,
		});
	}

	// Handle Zod validation errors
	if (error instanceof ZodError) {
		return reply.status(400).send({
			...errorResponse,
			statusCode: 400,
			message: "Validation failed",
			errorCode: "VALIDATION_ERROR",
			errors: error.errors,
		});
	}

	// Handle tRPC errors
	if (error instanceof TRPCError) {
		const trpcStatusToHttp: Record<string, number> = {
			PARSE_ERROR: 400,
			BAD_REQUEST: 400,
			INTERNAL_SERVER_ERROR: 500,
			UNAUTHORIZED: 401,
			FORBIDDEN: 403,
			NOT_FOUND: 404,
			METHOD_NOT_SUPPORTED: 405,
			TIMEOUT: 408,
			CONFLICT: 409,
			PRECONDITION_FAILED: 412,
			PAYLOAD_TOO_LARGE: 413,
			UNPROCESSABLE_CONTENT: 422,
			TOO_MANY_REQUESTS: 429,
			CLIENT_CLOSED_REQUEST: 499,
		};

		const httpStatus = trpcStatusToHttp[error.code] || 500;

		return reply.status(httpStatus).send({
			...errorResponse,
			message: error.message,
			errorCode: error.code,
		});
	}

	// Handle Fastify validation errors
	if ((error as FastifyError).validation) {
		return reply.status(400).send({
			...errorResponse,
			statusCode: 400,
			message: "Validation failed",
			errorCode: "VALIDATION_ERROR",
			errors: (error as FastifyError).validation,
		});
	}

	// Handle unknown errors
	// Log unhandled errors using Fastify logger
	if (_req && typeof _req.log?.error === "function") {
		_req.log.error(
			{
				url: _req.url,
				method: _req.method,
				error: error.message,
				stack: isDev ? error.stack : undefined,
			},
			"Unhandled error",
		);
	}

	return reply.status(500).send({
		...errorResponse,
		statusCode: 500,
		message: "An unexpected error occurred",
	});
};

// Register error handler with Fastify
export const registerErrorHandler = (server: FastifyInstance) => {
	// Set default error handler
	server.setErrorHandler((error, request, reply) => {
		handleError(error, request, reply);
	});

	// Add Not Found handler
	server.setNotFoundHandler((request, reply) => {
		reply.status(404).send({
			status: "error",
			message: `Route ${request.method}:${request.url} not found`,
			errorCode: "NOT_FOUND",
		});
	});

	// Log all errors
	server.addHook("onError", (request, reply, error, done) => {
		const logLevel =
			error instanceof AppError && error.statusCode < 500 ? "warn" : "error";
		request.log[logLevel](
			{
				url: request.url,
				method: request.method,
				statusCode: reply.statusCode,
				error: error.message,
				stack: isDev ? error.stack : undefined,
			},
			"Request error",
		);
		done();
	});
};
