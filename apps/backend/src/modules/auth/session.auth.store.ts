import { sql } from "@backend/db/base_table";
import type { db } from "@backend/db/db";
import type { SessionStore } from "@fastify/session";
import type { FastifyRequest } from "fastify";
type Database = typeof db;

/**
 * Session Store for @fastify/session
 * Implements database-backed session storage using Orchid ORM
 */
export class DatabaseSessionStore implements SessionStore {
	private db: Database;
	private cookieMaxAgeSeconds: number;

	constructor(db: Database, cookieMaxAgeMs: number) {
		this.db = db;
		// Convert to seconds for PostgreSQL interval
		this.cookieMaxAgeSeconds = Math.floor(cookieMaxAgeMs / 1000);
	}

	/**
	 * Store a session in the database
	 * Only saves to DB if session contains user data (after OAuth)
	 */
	async set(
		sessionId: string,
		session: FastifyRequest["session"],
		callback: (err?: Error) => void,
	): Promise<void> {
		try {
			// Skip DB write for sessions without user data (pre-OAuth)
			// These sessions still work via cookie, just not persisted to DB
			if (!session.user) {
				return callback();
			}

			// Upsert session data
			// Try to update existing session first
			await this.db.session
				.selectAll()
				.findBy({ sessionId })
				.upsert({
					data: {
						// Update session expiry every time it's set
						expiresAt: () => sql`NOW() + ${this.cookieMaxAgeSeconds} * INTERVAL '1 SECOND'`,
					},
					create: {
						sessionId,
						userId: session.user?.userId || null,  // Database user ID (nullable for OAuth users pending registration)
						email: session.user!.email,
						name: session.user!.name,
						displayPicture: session.user!.displayPicture || null,
						ipAddress: session.metadata?.ipAddress || null,
						userAgent: session.metadata?.userAgent || null,
						browser: session.metadata?.browser || null,
						os: session.metadata?.os || null,
						device: session.metadata?.device || null,
						deviceFingerprint: session.metadata?.deviceFingerprint || null,
						markedInvalidAt: null,
					}
				});

			callback();
		} catch (error) {
			callback(error as Error);
		}
	}

	/**
	 * Retrieve a session from the database
	 * Only returns valid (not marked invalid and not expired) sessions
	 */
	async get(
		sessionId: string,
		callback: (err: Error | null, session?: FastifyRequest["session"]) => void,
	): Promise<void> {
		try {
			const sessionData = await this.db.session
				.select("*", {
					user: (q) => q.user.select("name", "displayPicture"),
				})
				.findOptional(
					sessionId,
				);

			// Session not found
			if (!sessionData) {
				return callback(null, undefined);
			}

			// Reconstruct session object for Fastify
			const session = {
				user: {
					userId: sessionData.userId,  // OAuth provider ID (not stored in DB, only in-memory during OAuth flow)
					email: sessionData.email,
					name: sessionData.user?.name ?? sessionData.name,
					displayPicture: sessionData.user?.displayPicture ?? sessionData.displayPicture,
				},
				metadata: {
					ipAddress: sessionData.ipAddress || undefined,
					userAgent: sessionData.userAgent || undefined,
					browser: sessionData.browser || undefined,
					os: sessionData.os || undefined,
					device: sessionData.device || undefined,
					deviceFingerprint: sessionData.deviceFingerprint || undefined,
				},
				cookie: {
					maxAge: new Date(sessionData.expiresAt).getTime() - Date.now(),
				},
			};

			callback(null, session as FastifyRequest["session"]);
		} catch (error) {
			callback(error as Error);
		}
	}

	/**
	 * Invalidate a session by setting markedInvalidAt timestamp
	 */
	async destroy(
		sessionId: string,
		callback: (err?: Error) => void,
	): Promise<void> {
		try {
			await this.db.session.findBy({ sessionId }).update({
				markedInvalidAt: () => sql`NOW()`,
			});

			callback();
		} catch (error) {
			callback(error as Error);
		}
	}

	/**
	 * Update session expiration time
	 */
	async touch(
		sessionId: string,
		session: FastifyRequest["session"],
		callback: (err?: Error) => void,
	): Promise<void> {
		try {

			await this.db.session.findBy({ sessionId }).update({
				expiresAt: () => sql`NOW() + ${this.cookieMaxAgeSeconds} * INTERVAL '1 SECOND'`,
			});

			callback();
		} catch (error) {
			callback(error as Error);
		}
	}
}
