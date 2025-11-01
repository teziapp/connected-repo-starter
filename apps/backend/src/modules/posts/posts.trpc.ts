import { db } from "@backend/db/db";
import { protectedProcedure, trpcRouter } from "@backend/trpc";
import { postCreateInputZod, postGetByAuthorZod, postGetByIdZod } from "@connected-repo/zod-schemas/post.zod";

export const postsRouterTrpc = trpcRouter({
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
		getById: protectedProcedure.input(postGetByIdZod).query(async ({ input: { postId} }) => {
			const post = await db.post.find(postId);

			if (!post) {
				throw new Error("Post not found");
			}

			return post;
		}),

		// Create post
		create: protectedProcedure.input(postCreateInputZod).mutation(async ({ input }) => {
			// First verify the author exists
			const author = await db.user.where({ userId: input.authorUserId }).take();
			if (!author) {
				throw new Error("Author not found");
			}

			const newPost = await db.post.create({
				title: input.title,
				content: input.content,
				authorUserId: input.authorUserId,
			});
			return newPost;
		}),

		// Get posts by author
		getByAuthor: protectedProcedure
			.input(postGetByAuthorZod)
			.query(async ({ input }) => {
				const posts = await db.post
					.select("postId", "title", "content", "authorUserId", "createdAt", "updatedAt")
					.where({ authorUserId: input.authorUserId })
					.order({ createdAt: "DESC" });

				return posts;
			}),
	})