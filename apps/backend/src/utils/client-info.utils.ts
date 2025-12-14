import { createHash } from "node:crypto";
import { UAParser } from "ua-parser-js";

/**
 * Extract IP address from request headers
 * Handles proxied requests by checking X-Forwarded-For header
 */
export function getClientIpAddress(headers: Headers) {
	// Check X-Forwarded-For header (set by proxies/load balancers)
	const forwardedFor = headers.get("x-forwarded-for");
	if (forwardedFor) {
		// X-Forwarded-For can contain multiple IPs, get the first one (client IP)
		const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
		const ip = typeof ips === "string" ? ips.split(",")[0]?.trim() : ips;
		if (ip) {
			return ip;
		}
	}

	const xRealIp = headers.get("x-real-ip");

	// Check X-Real-IP header
	const realIp = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
	if (realIp && typeof realIp === "string") {
		return realIp;
	}

	// Fall back to unknown
	return "unknown";
}

/**
 * Generate a device fingerprint based on request headers, optimized for robustness.
 * Creates a stable hash of core browser/device characteristics.
 */
export function generateDeviceFingerprint(headers: Headers): string {
    // Normalize User-Agent: convert to lowercase for case-insensitivity
    const userAgent = headers.get("user-agent");
		const uaParser = new UAParser(userAgent || "");

    // Normalize Accept-Language: Only use the primary language code (e.g., 'en' from 'en-US,en;q=0.9')
		const acceptLanguage = headers.get("accept-language");
    const primaryLanguage = acceptLanguage
			? acceptLanguage!.split(',')[0] // Get the first (primary) part: 'en-US'
        ?.substring(0, 2) // Get the two-letter code: 'en'
        .toLowerCase() || ""
			: "";

		const secChUa = headers.get("sec-ch-ua");
		const secChUaMobile = headers.get("sec-ch-ua-mobile");
		const secChUaPlatform = headers.get("sec-ch-ua-platform");

		// Combine normalized components for fingerprinting
    const components = [
        // Core Parsed Components (Highly Stable)
        uaParser.getBrowser().name?.toString().toLowerCase(),
        uaParser.getOS().name?.toString().toLowerCase() || "",
        uaParser.getDevice().toString().toLowerCase() || "",

        // Stabilized Headers
        primaryLanguage,

        // Client Hints (Generally Stable for a given browser/OS)
        (Array.isArray(secChUa) ? secChUa[0] : secChUa || "").toLowerCase(),
        (Array.isArray(secChUaMobile) ? secChUaMobile[0] : secChUaMobile || "").toLowerCase(),
        (Array.isArray(secChUaPlatform) ? secChUaPlatform[0] : secChUaPlatform || "").toLowerCase(),

        // Removed: 'accept-encoding' and 'accept' as they are highly request/context-dependent.
    ];

    // Create a hash of the combined, normalized components
    const fingerprintString = components.join("|");
    const hash = createHash("sha256").update(fingerprintString).digest("hex");

    // Return first 32 characters for storage efficiency
    return hash.substring(0, 32);
}
