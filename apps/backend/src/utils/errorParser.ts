import { ORPCError } from "@orpc/server";
import { ZodError } from "zod";

export interface CustomError {
	message: string;
	code: string;
	details?: Record<string, any>;
	httpStatus: number;
	userFriendlyMessage: string;
	actionRequired?: string;
}

/**
 * Parse database and ORPC errors into user-friendly error responses
 * @param error - The error to parse (ORPCError or generic Error)
 */
export function orpcErrorParser(error: Error): CustomError {
	// Handle Zod validation errors
	if (error.cause instanceof ZodError) {
		const zodError = error.cause.flatten();
		return {
			message: "Validation failed",
			code: "VALIDATION_ERROR",
			details: {
				fieldErrors: zodError.fieldErrors,
				formErrors: zodError.formErrors,
			},
			httpStatus: 400,
			userFriendlyMessage: "Please check the provided data and try again",
			actionRequired: "Fix validation errors and resubmit",
		};
	}

	// Handle database constraint errors
	if (error.cause instanceof Error) {
		const causeMessage = error.cause.message.toLowerCase();

		// Unique constraint violations
		if (causeMessage.includes("duplicate key") || causeMessage.includes("unique constraint")) {
			return {
				message: "Resource already exists",
				code: "DUPLICATE_RESOURCE",
				details: {
					constraint: "unique",
					originalError: error.cause.message,
				},
				httpStatus: 409,
				userFriendlyMessage: "This resource already exists in the system",
				actionRequired: "Use a different value or update the existing resource",
			};
		}

		// Foreign key constraint violations
		if (causeMessage.includes("foreign key") || causeMessage.includes("violates foreign key constraint")) {
			return {
				message: "Invalid reference to related resource",
				code: "INVALID_REFERENCE",
				details: {
					constraint: "foreign_key",
					originalError: error.cause.message,
				},
				httpStatus: 400,
				userFriendlyMessage: "The referenced resource does not exist",
				actionRequired: "Ensure the referenced resource exists before creating this one",
			};
		}

		// Not found errors
		if (causeMessage.includes("not found") || causeMessage.includes("does not exist")) {
			return {
				message: "Resource not found",
				code: "RESOURCE_NOT_FOUND",
				details: {
					originalError: error.cause.message,
				},
				httpStatus: 404,
				userFriendlyMessage: "The requested resource could not be found",
				actionRequired: "Verify the resource identifier and try again",
			};
		}
	}

	// Handle standard ORPC errors
	const errorCode = error instanceof ORPCError ? error.code : "INTERNAL_SERVER_ERROR";
	switch (errorCode) {
		case "BAD_REQUEST":
			return {
				message: error.message,
				code: "BAD_REQUEST",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 400,
				userFriendlyMessage: "The request contains invalid data",
				actionRequired: "Please check your input and try again",
			};

		case "UNAUTHORIZED":
			return {
				message: error.message,
				code: "UNAUTHORIZED",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 401,
				userFriendlyMessage: "Authentication required",
				actionRequired: "Please log in and try again",
			};

		case "FORBIDDEN":
			return {
				message: error.message,
				code: "FORBIDDEN",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 403,
				userFriendlyMessage: "You don't have permission to perform this action",
				actionRequired: "Contact an administrator if you believe this is an error",
			};

		case "NOT_FOUND":
			return {
				message: error.message,
				code: "NOT_FOUND",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 404,
				userFriendlyMessage: "The requested resource was not found",
				actionRequired: "Verify the resource exists and try again",
			};

		case "CONFLICT":
			return {
				message: error.message,
				code: "CONFLICT",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 409,
				userFriendlyMessage: "There's a conflict with the current state of the resource",
				actionRequired: "Refresh the data and try again",
			};

		case "PRECONDITION_FAILED":
			return {
				message: error.message,
				code: "PRECONDITION_FAILED",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 412,
				userFriendlyMessage: "A precondition for this request was not met",
				actionRequired: "Ensure all prerequisites are satisfied",
			};

		case "TOO_MANY_REQUESTS":
			return {
				message: error.message,
				code: "RATE_LIMITED",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 429,
				userFriendlyMessage: "Too many requests. Please slow down",
				actionRequired: "Wait a moment before trying again",
			};

		case "INTERNAL_SERVER_ERROR":
		default:
			return {
				message: "An unexpected error occurred",
				code: "INTERNAL_SERVER_ERROR",
				details: error.cause ? { originalError: String(error.cause) } : undefined,
				httpStatus: 500,
				userFriendlyMessage: "Something went wrong on our end",
				actionRequired: "Please try again later or contact support if the problem persists",
			};
	}
}
