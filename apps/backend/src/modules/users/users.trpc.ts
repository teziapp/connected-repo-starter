import { db } from "@backend/db/db";
import { protectedProcedure, trpcRouter } from "@backend/trpc";
import { userCreateInputZod, userGetByIdInputZod } from "@connected-repo/zod-schemas/user.zod";

export const usersRouterTrpc = trpcRouter({
    // Get all users

    getAll: protectedProcedure.query(async () => {
      // Added code to simulate a error for testing
      // throw new Error("User not found");
      const users = await db.user.select("userId", "email", "name", "createdAt", "updatedAt");
      return users;
    }),

    // Get user by ID
    getById: protectedProcedure.input(userGetByIdInputZod).query(async ({ input: { userId } }) => {
      const user = await db.user.select("userId", "email", "name", "createdAt", "updatedAt").where({ userId }).take();

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),

    // Create user
    create: protectedProcedure.input(userCreateInputZod).mutation(async ({ input }) => {
      const newUser = await db.user.create({
        email: input.email,
        name: input.name,
      });
      return newUser;
    }),
  });