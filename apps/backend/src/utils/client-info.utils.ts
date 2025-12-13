import type { IncomingHttpHeaders } from "node:http";

/**
 * Extract browser, OS, and device information from request headers
 */
export function extractClientInfo(headers: IncomingHttpHeaders) {
	const userAgent = headers["user-agent"] || "";
	const secChUa = headers["sec-ch-ua"] as string | undefined;
	const secChUaMobile = headers["sec-ch-ua-mobile"] as string | undefined;
	const secChUaPlatform = headers["sec-ch-ua-platform"] as string | undefined;

	// Parse User-Agent for basic info
	const browser = parseBrowser(userAgent);
	const os = parseOS(userAgent);
	const device = parseDevice(userAgent, secChUaMobile);

	return {
		browser,
		os,
		device,
	};
}

/**
 * Generate a device fingerprint from request headers
 */
export function generateDeviceFingerprint(headers: IncomingHttpHeaders): string {
	const userAgent = headers["user-agent"] || "";
	const acceptLanguage = headers["accept-language"] || "";
	const secChUa = headers["sec-ch-ua"] as string | undefined;
	const secChUaMobile = headers["sec-ch-ua-mobile"] as string | undefined;
	const secChUaPlatform = headers["sec-ch-ua-platform"] as string | undefined;

	// Create a stable hash of device characteristics
	const components = [
		userAgent.toLowerCase(),
		acceptLanguage.split(',')[0]?.toLowerCase() || "", // Primary language only
		(secChUa || "").toLowerCase(),
		(secChUaMobile || "").toLowerCase(),
		(secChUaPlatform || "").toLowerCase(),
	];

	// Simple hash function for fingerprinting
	let hash = 0;
	for (const component of components) {
		for (let i = 0; i < component.length; i++) {
			const char = component.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
	}

	return Math.abs(hash).toString(36);
}

/**
 * Parse browser from User-Agent string
 */
function parseBrowser(userAgent: string): string {
	const ua = userAgent.toLowerCase();

	if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
	if (ua.includes('firefox')) return 'Firefox';
	if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
	if (ua.includes('edg')) return 'Edge';
	if (ua.includes('opera')) return 'Opera';

	return 'Unknown';
}

/**
 * Parse OS from User-Agent string
 */
function parseOS(userAgent: string): string {
	const ua = userAgent.toLowerCase();

	if (ua.includes('windows')) return 'Windows';
	if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macOS';
	if (ua.includes('linux')) return 'Linux';
	if (ua.includes('android')) return 'Android';
	if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

	return 'Unknown';
}

/**
 * Parse device type from User-Agent and Client Hints
 */
function parseDevice(userAgent: string, secChUaMobile?: string): string {
	const ua = userAgent.toLowerCase();

	// Check Client Hints first (more reliable)
	if (secChUaMobile === '?1') return 'Mobile';

	// Fallback to User-Agent parsing
	if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
	if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';

	return 'Desktop';
}