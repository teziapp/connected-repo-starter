import type { IncomingHttpHeaders } from "node:http";

// Session user type (will be populated from database session)
export interface SessionUser {
	userId?: string;
	email: string;
	name?: string | null;
	profilePictureUrl?: string | null;
}

// Database session structure
export interface DatabaseSession {
	sessionId: string;
	user?: SessionUser;
	createdAt: number;
	expiresAt: number;
	ipAddress?: string;
	userAgent?: string;
	browser?: string;
	os?: string;
	device?: string;
	fingerprint?: string;
}

// Base context available to all procedures
export interface AppContext {
	headers: IncomingHttpHeaders;
	sessionId?: string;
	session?: DatabaseSession | null;
}

// Context for authenticated procedures
export interface AuthenticatedContext extends AppContext {
	session: DatabaseSession;
	user: SessionUser & { userId: string };
}
