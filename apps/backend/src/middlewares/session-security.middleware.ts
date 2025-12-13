import { ORPCContext } from '@backend/procedures/public.procedure';
import { MiddlewareNextFn, ORPCError } from '@orpc/server';
import { generateDeviceFingerprint } from '@backend/utils/client-info.utils';

export interface SessionSecurityResult {
	isValid: boolean;
	isSuspicious: boolean;
	reasons: string[];
	action: 'allow' | 'warn' | 'block';
}

/**
 * Session security middleware - validates device fingerprint and IP address
 */
export const sessionSecurityMiddleware = (securityLevel: 'low' | 'moderate' | 'strict' = 'moderate') =>
	async ({ context, next }: { context: ORPCContext; next: MiddlewareNextFn<unknown> }) => {
		const session = context.session;

		// Skip validation if no session
		if (!session) {
			return next({ context });
		}

		const result: SessionSecurityResult = {
			isValid: true,
			isSuspicious: false,
			reasons: [],
			action: 'allow',
		};

		// Extract current client information
		const incomingHeaders = context.reqHeaders ? Object.fromEntries(context.reqHeaders.entries()) : {};
		const currentFingerprint = generateDeviceFingerprint(incomingHeaders);

		// Get current IP
		const currentIP = incomingHeaders['x-forwarded-for'] ||
			incomingHeaders['x-real-ip'] ||
			'unknown';

		// Check device fingerprint match
		if (session.deviceFingerprint && session.deviceFingerprint !== currentFingerprint) {
			result.isSuspicious = true;
			result.reasons.push(`Device fingerprint mismatch: stored=${session.deviceFingerprint}, current=${currentFingerprint}`);
		}

		// Check IP address (allow for dynamic IPs within same subnet for moderate security)
		if (session.ipAddress && session.ipAddress !== currentIP) {
			if (securityLevel === 'strict') {
				result.isSuspicious = true;
				result.reasons.push(`IP address changed: stored=${session.ipAddress}, current=${currentIP}`);
			} else if (securityLevel === 'moderate') {
				// Check if IPs are in same /24 subnet (common for mobile/home networks)
				const isSameSubnet = areSameSubnet(session.ipAddress, currentIP);
				if (!isSameSubnet) {
					result.isSuspicious = true;
					result.reasons.push(`IP address changed: stored=${session.ipAddress}, current=${currentIP}`);
				}
			}
			// Low security level allows IP changes
		}

		// Determine action based on security level and findings
		if (result.isSuspicious) {
			switch (securityLevel) {
				case 'strict':
					result.action = 'block';
					throw new ORPCError('FORBIDDEN', {
						status: 403,
						message: 'Session security violation detected',
						data: { reasons: result.reasons }
					});
				case 'moderate':
					result.action = 'warn';
					// Log warning but allow access
					console.warn('Session security warning:', result.reasons);
					break;
				case 'low':
					result.action = 'allow';
					break;
			}
		}

		return next({
			context: {
				...context,
				sessionSecurity: result,
			}
		});
	};

/**
 * Check if two IP addresses are in the same /24 subnet
 */
function areSameSubnet(ip1: string, ip2: string): boolean {
	try {
		const parts1 = ip1.split('.');
		const parts2 = ip2.split('.');

		// Check if first 3 octets match (same /24 subnet)
		return parts1.length === 4 && parts2.length === 4 &&
			parts1[0] === parts2[0] &&
			parts1[1] === parts2[1] &&
			parts1[2] === parts2[2];
	} catch {
		return false;
	}
}