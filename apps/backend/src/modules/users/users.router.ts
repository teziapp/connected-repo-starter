import { db } from "@backend/db/db";
import { protectedProcedure } from "@backend/procedures/protected.procedure";
import { publicProcedure } from "@backend/procedures/public.procedure";
import { userCreateInputZod, userGetByIdInputZod } from "@connected-repo/zod-schemas/user.zod";
import { ORPCError } from "@orpc/server";

// Get all users - requires authentication
export const getAll = protectedProcedure.handler(async () => {
	const users = await db.users.select("userId", "email", "name", "createdAt", "updatedAt");
	return users;
});

// Get user by ID - requires authentication
export const getById = protectedProcedure
	.input(userGetByIdInputZod)
	.handler(async ({ input: { userId } }) => {
		const user = await db.users
			.select("userId", "email", "name", "createdAt", "updatedAt")
			.where({ userId })
			.take();

		if (!user) {
			throw new ORPCError("NOT_FOUND", {
				status: 404,
				message: "User not found",
			});
		}

		return user;
	});

// Register user from OAuth flow - requires active session but not database user
export const create = publicProcedure
	.input(userCreateInputZod)
	.handler(async ({ input }) => {
		// Note: With better-auth, users are automatically created during OAuth
		// This endpoint might not be needed, or can be used for additional profile setup
		
		// For now, we'll create a user if they don't exist
		// In practice, better-auth already creates the user during OAuth
		
		const existingUser = await db.users.where({ email: input.email }).take();
		
		if (existingUser) {
			throw new ORPCError("BAD_REQUEST", {
				status: 400,
				message: "User already registered. Please go to dashboard.",
			});
		}

		// Create user in database
		const newUser = await db.users.create({
			email: input.email,
			name: input.name,
			displayPicture: input.displayPicture,
		});

		return newUser;
	});

export const usersRouter = {
	getAll,
	getById,
	create,
};
