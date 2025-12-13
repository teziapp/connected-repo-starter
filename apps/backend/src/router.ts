import { protectedProcedure } from '@backend/procedures/protected.procedure'
import { publicProcedure } from '@backend/procedures/public.procedure'
import { authRouter } from '@backend/modules/auth/auth.router'
import { InferRouterInputs, InferRouterOutputs, RouterClient } from '@orpc/server'
import * as z from 'zod'

// Phase 1: Basic health check and testing endpoints
// Modules will be added in later phases

// Health check endpoint
export const healthCheck = publicProcedure
	.route({ method: 'GET' })
	.handler(async () => {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			phase: 1,
			message: 'Phase 1: Core Infrastructure - oRPC server is running',
		}
	})

// Test public endpoint (with rate limiting)
export const testPublic = publicProcedure
	.input(z.object({
		message: z.string().optional(),
	}))
	.handler(async ({ input, context }) => {
		return {
			message: input.message || 'Hello from public endpoint!',
			timestamp: new Date().toISOString(),
			rateLimit: 'Global rate limiting active (10 req/min)',
		}
	})

// Test protected endpoint (requires auth - will fail in Phase 1)
export const testProtected = protectedProcedure
	.handler(async ({ context }) => {
		return {
			message: 'You are authenticated!',
			user: context.user,
			timestamp: new Date().toISOString(),
		}
	})

// Example planet schema for reference (will be replaced with real schemas in Phase 3)
const PlanetSchema = z.object({
	id: z.number().int().min(1),
	name: z.string(),
	description: z.string().optional(),
})

export const listPlanet = publicProcedure
	.input(
		z.object({
			limit: z.number().int().min(1).max(100).optional(),
			cursor: z.number().int().min(0).default(0),
		}),
	)
	.handler(async ({ input }) => {
		return [
			{ id: 1, name: 'Earth', description: 'Our home planet' },
			{ id: 2, name: 'Mars', description: 'The red planet' },
		]
	})

export const router = {
	// Phase 1 test endpoints
	health: healthCheck,
	test: {
		public: testPublic,
		protected: testProtected,
	},
	// Example endpoints
	planet: {
		list: listPlanet,
	},
	// Phase 2: auth endpoints
	auth: authRouter,
	// Phase 3: users, journalEntries, prompts will be added here
	// Phase 5: teams, subscriptions will be added here
};

export type BackendRouter = RouterClient<typeof router>;
export type BackendRouterInputs = InferRouterInputs<typeof router>
export type BackendRouterOutputs = InferRouterOutputs<typeof router>;
