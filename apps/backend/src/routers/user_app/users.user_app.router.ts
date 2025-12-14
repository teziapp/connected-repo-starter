import { db } from "@backend/db/db";
import { protectedProcedure } from "@backend/procedures/protected.procedure";
import { userGetByIdInputZod } from "@connected-repo/zod-schemas/user.zod";

// Get all users - requires authentication
export const getAll = protectedProcedure.handler(async () => {
	const users = await db.users.selectAll();
	return users;
});

// Get user by ID - requires authentication
export const getById = protectedProcedure
	.input(userGetByIdInputZod)
	.handler(async ({ input: { id: userId } }) => {
		return await db.users
			.selectAll()
			.find(userId);
	});

export const usersRouter = {
	getAll,
	getById,
};
