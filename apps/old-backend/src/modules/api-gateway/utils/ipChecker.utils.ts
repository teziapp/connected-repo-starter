/**
 * Normalize IPv6 address by expanding :: notation and converting to full form
 * @param ipv6 - IPv6 address (e.g., "2001:db8::1" or "::1")
 * @returns Normalized IPv6 address with all 8 hextets
 */
function normalizeIPv6(ipv6: string): string {
	// Remove leading/trailing whitespace
	ipv6 = ipv6.trim();

	// Split by ":"
	const parts = ipv6.split(":");

	// Find the position of "::" (if it exists)
	const doubleColonIndex = ipv6.indexOf("::");

	if (doubleColonIndex !== -1) {
		// Expand "::" notation
		const leftParts = ipv6.slice(0, doubleColonIndex).split(":").filter(Boolean);
		const rightParts = ipv6
			.slice(doubleColonIndex + 2)
			.split(":")
			.filter(Boolean);
		const missingParts = 8 - leftParts.length - rightParts.length;

		const expanded = [
			...leftParts,
			...Array(missingParts).fill("0"),
			...rightParts,
		];

		return expanded.map((part) => part.padStart(4, "0")).join(":");
	}

	// Already in full form, just pad each hextet
	return parts.map((part) => part.padStart(4, "0")).join(":");
}

/**
 * Check if two IP addresses are in the same subnet
 * - IPv4: /24 subnet (first 3 octets)
 * - IPv6: /64 subnet (first 4 hextets)
 * This allows for dynamic IPs within same network (common for mobile/home users)
 * @param ip1 - First IP address
 * @param ip2 - Second IP address
 * @returns true if IPs are in same subnet
 */
export function areSameSubnet(ip1: string, ip2: string): boolean {
	try {
		// Check if both are IPv4
		const isIPv4_1 = ip1.includes(".") && !ip1.includes(":");
		const isIPv4_2 = ip2.includes(".") && !ip2.includes(":");

		if (isIPv4_1 && isIPv4_2) {
			// IPv4: Compare first 3 octets (/24 subnet)
			const parts1 = ip1.split(".");
			const parts2 = ip2.split(".");

			if (parts1.length !== 4 || parts2.length !== 4) {
				return false;
			}

			return (
				parts1[0] === parts2[0] &&
				parts1[1] === parts2[1] &&
				parts1[2] === parts2[2]
			);
		}

		// Check if both are IPv6
		const isIPv6_1 = ip1.includes(":");
		const isIPv6_2 = ip2.includes(":");

		if (isIPv6_1 && isIPv6_2) {
			// IPv6: Compare first 4 hextets (/64 subnet)
			const normalized1 = normalizeIPv6(ip1);
			const normalized2 = normalizeIPv6(ip2);

			const parts1 = normalized1.split(":");
			const parts2 = normalized2.split(":");

			if (parts1.length !== 8 || parts2.length !== 8) {
				return false;
			}

			// Compare first 4 hextets (64 bits)
			return (
				parts1[0] === parts2[0] &&
				parts1[1] === parts2[1] &&
				parts1[2] === parts2[2] &&
				parts1[3] === parts2[3]
			);
		}

		// Mixed IPv4 and IPv6, cannot be in same subnet
		return false;
	} catch {
		return false;
	}
}

/**
 * Check if an IP address matches a whitelist entry
 * Supports exact match for both IPv4 and IPv6
 * IPv6 addresses are normalized before comparison
 * @param ip - Client IP address
 * @param whitelistEntry - Whitelist entry (exact IP)
 * @returns True if IP matches
 */
export function isIPWhitelisted(ip: string, whitelistEntry: string): boolean {
	// Check if both are IPv6
	const isIPv6Client = ip.includes(":");
	const isIPv6Whitelist = whitelistEntry.includes(":");

	if (isIPv6Client && isIPv6Whitelist) {
		// Normalize both IPv6 addresses before comparison
		try {
			const normalizedClient = normalizeIPv6(ip);
			const normalizedWhitelist = normalizeIPv6(whitelistEntry);
			return normalizedClient === normalizedWhitelist;
		} catch {
			return false;
		}
	}

	// IPv4 or mixed - direct comparison
	return ip === whitelistEntry;
}

/**
 * Check if domain matches a whitelist entry
 * Supports exact match and wildcard subdomains
 * @param requestOrigin - Request origin (e.g., "https://example.com")
 * @param whitelistEntry - Whitelist entry (e.g., "example.com" or "*.example.com")
 * @returns True if domain matches
 */
export function isDomainWhitelisted(
	requestOrigin: string,
	whitelistEntry: string,
): boolean {
	// Extract domain from origin (remove protocol and port)
	let domain: string;
	try {
		const url = new URL(requestOrigin);
		domain = url.hostname;
	} catch {
		// If not a valid URL, treat as plain domain
		domain = requestOrigin;
	}

	// Exact match
	if (domain === whitelistEntry) {
		return true;
	}

	// Wildcard subdomain match (*.example.com)
	if (whitelistEntry.startsWith("*.")) {
		const baseDomain = whitelistEntry.slice(2); // Remove "*."
		return domain.endsWith(`.${baseDomain}`) || domain === baseDomain;
	}

	return false;
}
