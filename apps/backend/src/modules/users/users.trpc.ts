import { db } from "@backend/db/db";
import { updateSessionUserId } from "@backend/modules/auth/session.auth.utils";
import { protectedProcedure, publicProcedure, trpcRouter } from "@backend/trpc";
import { userCreateInputZod, userGetByIdInputZod } from "@connected-repo/zod-schemas/user.zod";
import { TRPCError } from "@trpc/server";

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

    // Register user from OAuth flow
    create: publicProcedure.input(userCreateInputZod).mutation(async ({ input, ctx }) => {
      // Validate session exists
      if (!ctx.req.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active session found. Please login via OAuth first.",
        });
      }

      // Security check: ensure email matches session email
      if (ctx.req.session.user.email !== input.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Email mismatch. Cannot register with a different email than your OAuth account.",
        });
      }

      // Check if session already has a userId (user already registered)
      if (ctx.req.session.user.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already registered. Please go to dashboard.",
        });
      }

      // Create user in database
      const newUser = await db.user.create({
        email: input.email,
        name: input.name,
        displayPicture: input.displayPicture,
      });

      // Update session with new database userId
      await updateSessionUserId(ctx.req, newUser.userId);

      return newUser;
    }),
  });