import FastifyOtelInstrumentation from "@fastify/otel";
import type { AttributeValue } from "@opentelemetry/api";
import { metrics, SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { CompressionAlgorithm } from "@opentelemetry/otlp-exporter-base";
import {
	defaultResource,
	resourceFromAttributes,
} from "@opentelemetry/resources";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import {
	ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
	ATTR_HOST_NAME,
	ATTR_OS_TYPE,
	ATTR_OS_VERSION,
} from "@opentelemetry/semantic-conventions/incubating";
import { ClientRequest, IncomingMessage, ServerResponse } from "node:http";
import os from "node:os";

const packageJson = require("../../package.json");

// Initialize the Fastify OpenTelemetry instrumentation. This will register the instrumentation automatically on the Fastify server.
const _fastifyOtelInstrumentation = new FastifyOtelInstrumentation({
	registerOnInitialization: true,
});

// Enhanced logging utility with Middleware-style methods
const otelLogger = {
	info: (message: string, attributes?: Record<string, AttributeValue>) => {
		const span = trace.getActiveSpan();
		if (span) {
			span.addEvent(message, attributes);
		}
	},
	warn: (message: string, attributes?: Record<string, AttributeValue>) => {
		const span = trace.getActiveSpan();
		if (span) {
			span.addEvent(message, { ...attributes, level: "warn" });
		}
	},
	error: (
		message: string,
		error?: Error,
		attributes?: Record<string, AttributeValue>,
	) => {
		const span = trace.getActiveSpan();
		if (span) {
			span.recordException(error || new Error(message));
			span.setStatus({ code: SpanStatusCode.ERROR, message });
			if (attributes) {
				span.setAttributes(attributes);
			}
		}
	},
	debug: (message: string, attributes?: Record<string, AttributeValue>) => {
		const span = trace.getActiveSpan();
		if (span) {
			span.addEvent(message, { ...attributes, level: "debug" });
		}
	},
};

// CONFIG
const SERVICE_NAME = "Tezi Fast";
const SERVICE_VERSION = process.env.APP_VERSION || packageJson.version;
const APP_NAME = "@tezi/server";
const BASE_URL = process.env.OTLP_BASE_URL;
const AUTH_HEADER_KEY = process.env.OTLP_AUTH_HEADER_KEY || "Authorization";
const AUTH_HEADER_VALUE = process.env.OTLP_API_KEY || "";

// Enhanced resource with more attributes including app version
const resource = defaultResource().merge(
	resourceFromAttributes({
		[ATTR_SERVICE_NAME]: SERVICE_NAME,
		[ATTR_SERVICE_VERSION]: SERVICE_VERSION,
		[ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV || "development",
		[ATTR_HOST_NAME]: os.hostname(),
		[ATTR_OS_TYPE]: os.type(),
		[ATTR_OS_VERSION]: os.version(),
		"app.name": APP_NAME,
		"app.version": SERVICE_VERSION,
		"runtime.name": "nodejs",
		"runtime.version": process.version,
		"runtime.arch": process.arch,
		"process.pid": process.pid,
		"process.command": process.argv.join(" "),
		"deployment.environment": process.env.NODE_ENV || "development",
		"deployment.version": SERVICE_VERSION,
	}),
);

// Exporters with enhanced configuration and error handling
const traceExporter = new OTLPTraceExporter({
	url: `${BASE_URL}/v1/traces`,
	headers: {
		[AUTH_HEADER_KEY]: AUTH_HEADER_VALUE,
		"Content-Type": "application/json",
	},
	concurrencyLimit: 10,
	compression: CompressionAlgorithm.GZIP,
	timeoutMillis: 30000,
});

const metricExporter = new OTLPMetricExporter({
	url: `${BASE_URL}/v1/metrics`,
	headers: {
		[AUTH_HEADER_KEY]: AUTH_HEADER_VALUE,
		"Content-Type": "application/json",
	},
	concurrencyLimit: 10,
	compression: CompressionAlgorithm.GZIP,
	timeoutMillis: 30000,
});

const logExporter = new OTLPLogExporter({
	url: `${BASE_URL}/v1/logs`,
	headers: {
		[AUTH_HEADER_KEY]: AUTH_HEADER_VALUE,
		"Content-Type": "application/json",
	},
	concurrencyLimit: 10,
	compression: CompressionAlgorithm.GZIP,
	timeoutMillis: 30000,
});

// Custom metrics for business KPIs
const meter = metrics.getMeter(SERVICE_NAME);
const requestCounter = meter.createCounter("http_requests_total", {
	description: "Total number of HTTP requests",
});
const requestDuration = meter.createHistogram("http_request_duration_seconds", {
	description: "HTTP request duration in seconds",
});
const errorCounter = meter.createCounter("http_errors_total", {
	description: "Total number of HTTP errors",
});
const activeConnections = meter.createUpDownCounter("active_connections", {
	description: "Number of active connections",
});

// Enhanced instrumentations with maximum detail capture
const instrumentations = getNodeAutoInstrumentations({
	// HTTP instrumentation with enhanced details and custom metrics
	"@opentelemetry/instrumentation-http": {
		enabled: true,
		ignoreIncomingRequestHook: (req) => {
			const url = req.url || "";
			// Ignore health checks and telemetry endpoints
			return (
				url.includes("/health") ||
				url.includes("/metrics") ||
				url.includes("/telemetry") ||
				url.includes("/favicon.ico") ||
				url.includes("/robots.txt")
			);
		},
		ignoreOutgoingRequestHook: (options) => {
			const hostname = typeof options === "string" ? options : options.hostname;
			// Ignore telemetry exports to prevent loops
			return Boolean(
				hostname?.includes("middleware.io") ||
					hostname?.includes("localhost:4318"),
			);
		},
		startIncomingSpanHook: (request) => {
			const span = trace.getActiveSpan();
			if (span) {
				// Enhanced incoming request attributes
				span.setAttributes({
					"service.type": "incoming",
					"http.request.method": request.method || "UNKNOWN",
					"http.request.url": request.url || "",
					"http.request.scheme": "http",
					"http.request.user_agent": request.headers?.["user-agent"] || "",
					"http.request.content_type": request.headers?.["content-type"] || "",
					"http.request.content_length":
						request.headers?.["content-length"] || 0,
					"http.request.host": request.headers?.host || "",
					"http.request.referer": request.headers?.referer || "",
					"network.peer.address": request.socket?.remoteAddress || "",
					"network.peer.port": request.socket?.remotePort || 0,
					"network.protocol.version": request.httpVersion || "",
					"server.address": request.headers?.host?.split(":")[0] || "",
					"server.port": request.headers?.host?.split(":")[1] || "3000",
				});

				try {
					const userId = request.headers?.["x-user-id"];
					const traceId = request.headers?.["x-trace-id"];

					if (userId) span?.setAttribute("user.id", userId);
					if (traceId) span?.setAttribute("parent.trace.id", traceId);
				} catch {}

				// Increment request counter
				requestCounter.add(1, {
					method: request.method || "UNKNOWN",
					url: request.url || "",
					service: SERVICE_NAME,
				});
			}
			return {
				operationName: `${request.method} ${request.url}`,
				kind: SpanKind.SERVER,
			};
		},
		responseHook: (span, response) => {
			const isServerResponse = response instanceof ServerResponse;
			const duration = 0; // We'll calculate this differently

			span.setAttributes({
				"http.response.status_code": response.statusCode,
				"http.response.content_type": isServerResponse
					? response.getHeader?.("content-type") || ""
					: "",
				"http.response.content_length": isServerResponse
					? response.getHeader?.("content-length") || 0
					: 0,
				"http.response.cache_control": isServerResponse
					? response.getHeader?.("cache-control") || ""
					: "",
				"http.request.duration_seconds": duration,
			});

			// Record request duration
			const method = "UNKNOWN"; // We'll get this from span context if needed
			requestDuration.record(duration, {
				method,
				status_code: response.statusCode?.toString() || "0",
				service: SERVICE_NAME,
			});

			// Set span status based on HTTP status code
			if (response.statusCode && response.statusCode >= 400) {
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: `HTTP ${response.statusCode}`,
				});

				// Increment error counter
				errorCounter.add(1, {
					method,
					status_code: response.statusCode.toString(),
					service: SERVICE_NAME,
				});
			}
		},
		requestHook: (span, request) => {
			const isClientRequest = request instanceof ClientRequest;
			// Enhanced outgoing request attributes
			let url: URL;
			try {
				url = new URL(
					request instanceof IncomingMessage ? request.url || "" : "",
				);
			} catch {
				url = new URL("");
			}
			span.setAttributes({
				"service.type": "outgoing",
				"http.request.method": request.method || "GET",
				"http.request.url": isClientRequest
					? request.path || ""
					: request.url || "",
				"http.request.scheme": url.protocol.replace(":", ""),
				"http.request.host": url.hostname,
				"http.request.port":
					url.port || (url.protocol === "https:" ? "443" : "80"),
				"http.request.path":
					url.pathname || (isClientRequest ? request.path || "" : ""),
				"http.request.query": url.search,
				"http.request.user_agent": isClientRequest
					? request.getHeader?.("user-agent") || ""
					: "",
				"http.request.content_type": isClientRequest
					? request.getHeader?.("content-type") || ""
					: "",
				"http.request.content_length": isClientRequest
					? request.getHeader?.("content-length") || 0
					: 0,
				"http.request.authorization": isClientRequest
					? request.getHeader?.("authorization")
						? "[REDACTED]"
						: ""
					: "",
			});

			// Add triggering context from current span
			const activeSpan = trace.getActiveSpan();
			if (activeSpan) {
				const spanContext = activeSpan.spanContext();
				span.setAttributes({
					"triggering.trace.id": spanContext.traceId,
					"triggering.span.id": spanContext.spanId,
				});
			}
		},
	},

	// Fastify instrumentation (replaces Express)
	"@opentelemetry/instrumentation-fastify": {
		enabled: true,
	},

	// Enhanced PostgreSQL instrumentation
	"@opentelemetry/instrumentation-pg": {
		enabled: true,
		enhancedDatabaseReporting: true,
		addSqlCommenterCommentToQueries: true,
		responseHook: (span, responseInfo) => {
			if (responseInfo.data) {
				span.setAttributes({
					"db.response.row_count": responseInfo.data.rowCount || 0,
				});
			}
		},
	},

	// AWS SDK instrumentation for SES and other services
	"@opentelemetry/instrumentation-aws-sdk": {
		enabled: true,
		sqsExtractContextPropagationFromPayload: true,
		suppressInternalInstrumentation: true,
		responseHook: (span, response) => {
			span.setAttributes({
				"aws.response.request_id": response.response.requestId || "",
			});
		},
		preRequestHook: (span, request) => {
			// Add AWS service specific attributes
			span.setAttributes({
				"aws.service": request.request.serviceName || "",
				"aws.operation": request.request.commandName || "",
				"aws.region": request.request.region || process.env.AWS_REGION || "",
				"aws.module_version": request.moduleVersion || "",
			});

			// Add SES specific attributes
			if (request.request.serviceName === "SES") {
				if (request.request.commandInput?.Destination?.ToAddresses) {
					span.setAttribute(
						"ses.to_addresses_count",
						request.request.commandInput.Destination.ToAddresses.length,
					);
				}
				if (request.request.commandInput?.Source) {
					span.setAttribute("ses.from_address", "[REDACTED]"); // Don't log actual email
				}
				if (request.request.commandInput?.Message?.Subject?.Data) {
					span.setAttribute(
						"ses.subject",
						request.request.commandInput.Message.Subject.Data,
					);
				}
			}
		},
	},

	// Pino instrumentation for logger correlation
	"@opentelemetry/instrumentation-pino": {
		enabled: true,
		logHook: (span, record) => {
			// Correlate logs with traces
			const spanContext = span.spanContext();
			record.traceId = spanContext.traceId;
			record.spanId = spanContext.spanId;
			record.traceFlags = spanContext.traceFlags;
		},
	},

	// DNS instrumentation for network debugging
	"@opentelemetry/instrumentation-dns": {
		enabled: true,
		ignoreHostnames: ["localhost", "127.0.0.1"],
	},

	// Net instrumentation for socket-level debugging
	"@opentelemetry/instrumentation-net": {
		enabled: true,
	},

	// Disable fs instrumentation (too noisy)
	"@opentelemetry/instrumentation-fs": {
		enabled: false,
	},
});

// Create SDK with all configurations
const sdk = new NodeSDK({
	instrumentations,
	logRecordProcessors: [
		new BatchLogRecordProcessor(logExporter, {
			maxQueueSize: 1000,
			scheduledDelayMillis: 1000,
			exportTimeoutMillis: 30000,
			maxExportBatchSize: 100,
		}),
	],
	metricReader: new PeriodicExportingMetricReader({
		exporter: metricExporter,
		exportIntervalMillis: 5000, // Export every 5 seconds
	}),
	resource,
	spanProcessors: [
		new BatchSpanProcessor(traceExporter, {
			maxQueueSize: 1000,
			scheduledDelayMillis: 1000,
			exportTimeoutMillis: 30000,
			maxExportBatchSize: 100,
		}),
	],
	traceExporter,
});

// Initialize SDK
sdk.start();

// Context helper for manual trace correlation
export function getTraceContext() {
	const activeSpan = trace.getActiveSpan();
	if (!activeSpan) return {};

	const spanContext = activeSpan.spanContext();
	return {
		traceId: spanContext.traceId,
		spanId: spanContext.spanId,
		traceFlags: spanContext.traceFlags,
	};
}

// Enhanced log context with trace correlation
export function getLogContext() {
	const traceContext = getTraceContext();

	return {
		"app.name": APP_NAME,
		"service.name": SERVICE_NAME,
		"env.node_env": process.env.NODE_ENV || "development",
		"host.name": os.hostname(),
		"os.type": os.type(),
		"os.version": os.version(),
		"runtime.name": "nodejs",
		"runtime.version": process.version,
		"runtime.arch": process.arch,
		"process.id": process.pid,
		"process.uptime": process.uptime(),
		...traceContext,
	};
}

// Middleware-style logging functions
export const tracker = {
	info: (message: string, attributes?: Record<string, AttributeValue>) => {
		otelLogger.info(message, attributes);
	},
	warn: (message: string, attributes?: Record<string, AttributeValue>) => {
		otelLogger.warn(message, attributes);
	},
	error: (
		message: string,
		error?: Error,
		attributes?: Record<string, AttributeValue>,
	) => {
		otelLogger.error(message, error, attributes);
	},
	debug: (message: string, attributes?: Record<string, AttributeValue>) => {
		otelLogger.debug(message, attributes);
	},
	setAttribute: (key: string, value: AttributeValue) => {
		const span = trace.getActiveSpan();
		if (span) {
			span.setAttribute(key, value);
		}
	},
	errorRecord: (error: Error, attributes?: Record<string, AttributeValue>) => {
		const span = trace.getActiveSpan();
		if (span) {
			span.recordException(error);
			span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
			if (attributes) {
				span.setAttributes(attributes);
			}
		}
		otelLogger.error("Error recorded", error, attributes);
	},
};

// Custom span creation helper
export function createCustomSpan(
	name: string,
	kind: SpanKind = SpanKind.INTERNAL,
) {
	const tracer = trace.getTracer(SERVICE_NAME);
	return tracer.startSpan(name, { kind });
}

// Business metrics helpers
export const businessMetrics = {
	incrementRequest: (method: string, url: string) => {
		requestCounter.add(1, { method, url, service: SERVICE_NAME });
	},
	recordRequestDuration: (
		duration: number,
		method: string,
		statusCode: string,
	) => {
		requestDuration.record(duration, {
			method,
			status_code: statusCode,
			service: SERVICE_NAME,
		});
	},
	incrementError: (method: string, statusCode: string) => {
		errorCounter.add(1, {
			method,
			status_code: statusCode,
			service: SERVICE_NAME,
		});
	},
	setActiveConnections: (count: number) => {
		activeConnections.add(count, { service: SERVICE_NAME });
	},
};

// Graceful shutdown with proper resource cleanup (Middleware style)
export const flushOpenTelemetryResources = async () => {
	try {
		otelLogger.info("Starting OpenTelemetry shutdown...");
		await sdk.shutdown();
		otelLogger.info("OpenTelemetry shutdown completed successfully");
	} catch (error) {
		otelLogger.error("Error during OpenTelemetry shutdown", error as Error);
	}
};

// Handle process signals for graceful shutdown
process.on("SIGTERM", async () => {
	otelLogger.info("SIGTERM received, shutting down OpenTelemetry...");
	await flushOpenTelemetryResources();
	process.exit(0);
});

process.on("SIGINT", async () => {
	otelLogger.info("SIGINT received, shutting down OpenTelemetry...");
	await flushOpenTelemetryResources();
	process.exit(0);
});

// Export SDK shutdown function for manual control
export const sdkShutdown = flushOpenTelemetryResources;

export default sdk;
