import { db } from "@backend/db/db";
import { protectedProcedure, publicProcedure, trpcRouter } from "@backend/trpc";
//import { tracing } from "./tracing-middleware";

import {
	createPostSchema,
	getPostByIdSchema,
	getPostsByAuthorSchema,
	type CreatePostInput,
	type GetPostByIdInput,
	type GetPostsByAuthorInput,
} from "@backend/db/tables/post.table";
import {
	createUserSchema,
	getUserByIdSchema,
	type CreateUserInput,
	type GetUserByIdInput,
} from "@backend/db/tables/user.table";

export const appTrpcRouter = trpcRouter({
	hello: publicProcedure.query(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return "Hello from tRPC";
	}),

	// User routes
	user: trpcRouter({
		// Get all users

		getAll: protectedProcedure.query(async () => {
			// Added code to simulate a error for testing
			// throw new Error("User not found");
			const users = await db.user.select("id", "email", "name", "createdAt", "updatedAt");
			return users;
		}),

		// Get user by ID
		getById: protectedProcedure.input(getUserByIdSchema).query(async ({ input }: { input: GetUserByIdInput }) => {
			const user = await db.user.select("id", "email", "name", "createdAt", "updatedAt").where({ id: input.id }).take();

			if (!user) {
				throw new Error("User not found");
			}

			return user;
		}),

		// Create user
		create: protectedProcedure.input(createUserSchema).mutation(async ({ input }: { input: CreateUserInput }) => {
			const newUser = await db.user.create({
				email: input.email,
				name: input.name,
			});
			return newUser;
		}),
	}),

	// Post routes
	post: trpcRouter({
		// Get all posts with author information
		getAll: protectedProcedure.query(async () => {
			// Added code to simulate a error for testing
			//throw new Error("post not found");

			const posts = await db.post.select("*", {
				author: (q) => q.author.select("*"),
			});
			return posts;
		}),

		// Get post by ID with author
		getById: protectedProcedure.input(getPostByIdSchema).query(async ({ input }: { input: GetPostByIdInput }) => {
			const post = await db.post.select("*").where({ id: input.id }).take();

			if (!post) {
				throw new Error("Post not found");
			}

			return post;
		}),

		// Create post
		create: protectedProcedure.input(createPostSchema).mutation(async ({ input }: { input: CreatePostInput }) => {
			// First verify the author exists
			const author = await db.user.where({ id: input.authorId }).take();
			if (!author) {
				throw new Error("Author not found");
			}

			const newPost = await db.post.create({
				title: input.title,
				content: input.content,
				authorId: input.authorId,
			});
			return newPost;
		}),

		// Get posts by author
		getByAuthor: protectedProcedure
			.input(getPostsByAuthorSchema)
			.query(async ({ input }: { input: GetPostsByAuthorInput }) => {
				const posts = await db.post
					.select("id", "title", "content", "authorId", "createdAt", "updatedAt")
					.where({ authorId: input.authorId })
					.order({ createdAt: "DESC" });

				return posts;
			}),
	}),
});

export type AppTrpcRouter = typeof appTrpcRouter;
// export type RouterOutputs = inferRouterOutputs<AppTrpcRouter>;
