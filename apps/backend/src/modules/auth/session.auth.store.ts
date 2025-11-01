import { cookieMaxAge } from "@backend/app";
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

	constructor(db: Database) {
		this.db = db;
	}

	/**
	 * Store a session in the database
	 */
	async set(
		sessionId: string,
		session: FastifyRequest["session"],
		callback: (err?: Error) => void,
	): Promise<void> {
		try {
			if (!session.user) {
				return callback(new Error("Session must contain user data"));
			}

			// Upsert session data
			await this.db.session
				.findBy({ sessionId })
				.update({
					// Update session expiry every time it's set
					expiresAt: () => sql`NOW() + INTERVAL ${cookieMaxAge} SECOND `,
				})
				.catch(async () => {
					// If session doesn't exist, create it
					await this.db.session.create({
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
						expiresAt: () => sql`NOW() + INTERVAL ${cookieMaxAge} SECOND `,
						markedInvalidAt: null,
					});
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
				.findOptional(
					sessionId,
				).where({
					markedInvalidAt: null,
					expiresAt: {
						gt: sql`NOW()`
					},
				})
				.select("*", {
					user: (q) => q.user.select("name", "displayPicture"),
				});

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
				expiresAt: () => sql`NOW() + INTERVAL ${cookieMaxAge} SECOND `,
			});

			callback();
		} catch (error) {
			callback(error as Error);
		}
	}
}
