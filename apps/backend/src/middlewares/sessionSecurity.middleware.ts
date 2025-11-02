import { generateDeviceFingerprint, getClientIpAddress } from "@backend/utils/request-metadata.utils";
import type { FastifyRequest } from "fastify";

/**
 * Security validation levels for session fingerprint checking
 */
export enum SessionSecurityLevel {
	/**
	 * Lenient - Only logs suspicious activity, doesn't block
	 * Use for: Initial rollout, analytics
	 */
	LENIENT = "lenient",

	/**
	 * Moderate - Blocks device changes, warns on IP changes
	 * Use for: Production with good user experience
	 */
	MODERATE = "moderate",

	/**
	 * Strict - Immediately invalidates sessions with any suspicious activity
	 * Use for: High-security applications, sensitive operations
	 */
	STRICT = "strict",
}

/**
 * Result of session security validation
 */
export interface SessionSecurityResult {
	isValid: boolean;
	isSuspicious: boolean;
	reasons: string[];
	action: "allow" | "warn" | "block";
}

/**
 * Validate session security by comparing device fingerprint and IP address
 *
 * @param request - Fastify request object
 * @param securityLevel - Security level to enforce (default: MODERATE)
 * @returns Validation result with action to take
 */
export function validateSessionSecurity(
	request: FastifyRequest,
	securityLevel: SessionSecurityLevel = SessionSecurityLevel.MODERATE,
): SessionSecurityResult {
	const result: SessionSecurityResult = {
		isValid: true,
		isSuspicious: false,
		reasons: [],
		action: "allow",
	};

	// No session or no user - skip validation
	if (!request.session?.user || !request.session?.metadata) {
		return result;
	}

	const storedMetadata = request.session.metadata;
	const currentFingerprint = generateDeviceFingerprint(request);
	const currentIp = getClientIpAddress(request);

	// Check device fingerprint match
	if (storedMetadata.deviceFingerprint && storedMetadata.deviceFingerprint !== currentFingerprint) {
		result.isSuspicious = true;
		result.reasons.push("Device fingerprint mismatch");
	}

	// Check IP address (allow for dynamic IPs within same subnet)
	if (storedMetadata.ipAddress && storedMetadata.ipAddress !== currentIp) {
		// Check if IPs are in same /24 subnet (common for mobile/home networks)
		const isSameSubnet = areSameSubnet(storedMetadata.ipAddress, currentIp);
		if (!isSameSubnet) {
			result.isSuspicious = true;
			result.reasons.push(`IP address changed: ${storedMetadata.ipAddress} -> ${currentIp}`);
		}
	}

	// Determine action based on security level
	if (result.isSuspicious) {
		switch (securityLevel) {
			case SessionSecurityLevel.STRICT:
				result.isValid = false;
				result.action = "block";
				request.log.warn({
					userId: request.session.user.userId,
					email: request.session.user.email,
					reasons: result.reasons,
					storedFingerprint: storedMetadata.deviceFingerprint,
					currentFingerprint,
					storedIp: storedMetadata.ipAddress,
					currentIp,
				}, "Session security validation failed - BLOCKING (STRICT)");
				break;

			case SessionSecurityLevel.MODERATE:
				// MODERATE blocks on fingerprint mismatch but allows IP changes
				if (result.reasons.includes("Device fingerprint mismatch")) {
					result.isValid = false;
					result.action = "block";
					request.log.warn({
						userId: request.session.user.userId,
						email: request.session.user.email,
						reasons: result.reasons,
						storedFingerprint: storedMetadata.deviceFingerprint,
						currentFingerprint,
						storedIp: storedMetadata.ipAddress,
						currentIp,
					}, "Session security validation failed - BLOCKING (MODERATE: device mismatch)");
				} else {
					// Only IP change - warn but allow
					result.action = "warn";
					request.log.warn({
						userId: request.session.user.userId,
						email: request.session.user.email,
						reasons: result.reasons,
						storedIp: storedMetadata.ipAddress,
						currentIp,
					}, "Session security validation flagged suspicious activity - WARNING (IP change only)");
				}
				break;

			case SessionSecurityLevel.LENIENT:
				result.action = "allow";
				request.log.info({
					userId: request.session.user.userId,
					email: request.session.user.email,
					reasons: result.reasons,
				}, "Session security validation detected anomaly - LOGGING ONLY");
				break;
		}
	}

	return result;
}

/**
 * Check if two IP addresses are in the same /24 subnet
 * This allows for dynamic IPs within same network (common for mobile/home users)
 *
 * @param ip1 - First IP address
 * @param ip2 - Second IP address
 * @returns true if IPs are in same /24 subnet
 */
function areSameSubnet(ip1: string, ip2: string): boolean {
	try {
		// Handle IPv4 only for now
		const parts1 = ip1.split(".");
		const parts2 = ip2.split(".");

		if (parts1.length !== 4 || parts2.length !== 4) {
			return false; // Not IPv4 or invalid format
		}

		// Compare first 3 octets (/24 subnet)
		return parts1[0] === parts2[0] && parts1[1] === parts2[1] && parts1[2] === parts2[2];
	} catch {
		return false;
	}
}

/**
 * Fastify hook to validate session security on each request
 * Add this to your Fastify app to enable automatic session security checks
 *
 * Example usage in app.ts:
 * ```typescript
 * import { sessionSecurityHook } from "./middlewares/sessionSecurity.middleware";
 *
 * app.addHook("onRequest", sessionSecurityHook(SessionSecurityLevel.MODERATE));
 * ```
 */
export function sessionSecurityHook(securityLevel: SessionSecurityLevel = SessionSecurityLevel.MODERATE) {
	return async (request: FastifyRequest) => {
		// Skip validation for public endpoints
		if (!request.session?.user) {
			return;
		}

		const result = validateSessionSecurity(request, securityLevel);

		// Block request if validation failed
		if (result.action === "block") {
			throw new Error("Session security validation failed. Please log in again.");
		}

		// For moderate level, attach warning to request for sensitive operations to check
		// if (result.action === "warn") {
		// 	// TODO: Optional enhancement - Send email to user about suspicious activity
		// }
	};
}
