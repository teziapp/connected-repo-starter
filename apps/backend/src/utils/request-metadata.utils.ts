import type { FastifyRequest } from "fastify";
import { createHash } from "node:crypto";
import { UAParser } from "ua-parser-js";

/**
 * Extract IP address from request
 * Handles proxied requests by checking X-Forwarded-For header
 */
export function getClientIpAddress(request: FastifyRequest): string {
	// Check X-Forwarded-For header (set by proxies/load balancers)
	const forwardedFor = request.headers["x-forwarded-for"];
	if (forwardedFor) {
		// X-Forwarded-For can contain multiple IPs, get the first one (client IP)
		const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
		const ip = typeof ips === "string" ? ips.split(",")[0]?.trim() : ips;
		if (ip) {
			return ip;
		}
	}

	// Check X-Real-IP header
	const realIp = Array.isArray(request.headers["x-real-ip"]) ? request.headers["x-real-ip"][0] : request.headers["x-real-ip"];
	if (realIp && typeof realIp === "string") {
		return realIp;
	}

	// Fall back to socket IP
	return request.ip || "unknown";
}

/**
 * Parse user agent using ua-parser-js
 * Returns structured data about browser, OS, and device
 */
export function parseUserAgent(userAgentString: string) {
	const parser = new UAParser(userAgentString);
	const result = parser.getResult();

	return {
		raw: userAgentString,
		browser: {
			name: result.browser.name || "unknown",
			version: result.browser.version || "unknown",
		},
		os: {
			name: result.os.name || "unknown",
			version: result.os.version || "unknown",
		},
		device: {
			type: result.device.type || "desktop",
			vendor: result.device.vendor || "unknown",
			model: result.device.model || "unknown",
		},
		engine: {
			name: result.engine.name || "unknown",
			version: result.engine.version || "unknown",
		},
	};
}

/**
 * Generate a device fingerprint based on request headers, optimized for robustness.
 * Creates a stable hash of core browser/device characteristics.
 */
export function generateDeviceFingerprint(request: FastifyRequest): string {
    // Normalize User-Agent: convert to lowercase for case-insensitivity
    const userAgent = (request.headers["user-agent"] || "").toLowerCase();
    const parsed = parseUserAgent(userAgent);

    // Normalize Accept-Language: Only use the primary language code (e.g., 'en' from 'en-US,en;q=0.9')
		const acceptLanguage = request.headers["accept-language"] || "";
    const primaryLanguage = acceptLanguage 
			? acceptLanguage!.split(',')[0] // Get the first (primary) part: 'en-US'
        ?.substring(0, 2) // Get the two-letter code: 'en'
        .toLowerCase() || ""
			: "";

    const components = [
        // Core Parsed Components (Highly Stable)
        parsed.browser.name?.toLowerCase() || "",
        parsed.os.name?.toLowerCase() || "",
        parsed.device.type?.toLowerCase() || "",
        
        // Stabilized Headers
        primaryLanguage, 
        
        // Client Hints (Generally Stable for a given browser/OS)
        (Array.isArray(request.headers["sec-ch-ua"]) ? request.headers["sec-ch-ua"][0] || "" : request.headers["sec-ch-ua"] || "").toLowerCase(),
        (Array.isArray(request.headers["sec-ch-ua-mobile"]) ? request.headers["sec-ch-ua-mobile"][0] || "" : request.headers["sec-ch-ua-mobile"] || "").toLowerCase(),
        (Array.isArray(request.headers["sec-ch-ua-platform"]) ? request.headers["sec-ch-ua-platform"][0] || "" : request.headers["sec-ch-ua-platform"] || "").toLowerCase(),
        
        // Removed: 'accept-encoding' and 'accept' as they are highly request/context-dependent.
    ];

    // Create a hash of the combined, normalized components
    const fingerprintString = components.join("|");
    const hash = createHash("sha256").update(fingerprintString).digest("hex");

    // Return first 32 characters for storage efficiency
    return hash.substring(0, 32);
}
