import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

/**
 * Generate a cryptographically secure API key with prefix
 * @returns Plain API key string (format: sk_live_<32 random chars>)
 */
export function generateApiKey(): string {
	const randomBytes = crypto.randomBytes(24); // 24 bytes = 32 base64 chars
	const randomString = randomBytes.toString("base64url").slice(0, 32);
	return `sk_live_${randomString}`;
}

/**
 * Hash an API key using scrypt from node:crypto
 * @param plainKey - The plain text API key to hash
 * @returns Hash in format: salt:hash (both hex encoded)
 */
export async function hashApiKey(plainKey: string): Promise<string> {
	const salt = crypto.randomBytes(16).toString("hex");
	const derivedKey = (await scrypt(plainKey, salt, 64)) as Buffer;
	return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a plain API key against a scrypt hash
 * @param plainKey - The plain text API key to verify
 * @param hash - The hash in format: salt:hash (both hex encoded)
 * @returns True if the key matches the hash, false otherwise
 */
export async function verifyApiKey(
	plainKey: string,
	hash: string,
): Promise<boolean> {
	const [salt, storedHash] = hash.split(":");
	if (!salt || !storedHash) {
		return false;
	}

	const derivedKey = (await scrypt(plainKey, salt, 64)) as Buffer;
	const derivedHash = derivedKey.toString("hex");

	// Use timing-safe comparison
	return crypto.timingSafeEqual(
		Buffer.from(storedHash, "hex"),
		Buffer.from(derivedHash, "hex"),
	);
}
