import { z } from "zod";
import { BaseTable } from "../base_table";

export class PostTable extends BaseTable {
	readonly table = "post";
	
	columns = this.setColumns((t) => ({
		id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		title: t.string(),
		content: t.text(),
		authorId: t.uuid().foreignKey("user", "id"),
		createdAt: t.timestamp().default(t.sql`now()`),
		updatedAt: t.timestamp().default(t.sql`now()`),
	}));
	
	relations = {
		author: this.belongsTo(() => UserTable, {
			columns: ["authorId"],
			references: ["id"],
		}),
	};
}

// Import UserTable after the PostTable definition to avoid circular imports
import { UserTable } from "./user.table";

// Zod schemas for validation
export const createPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	authorId: z.string().uuid(),
});

export const getPostByIdSchema = z.object({
	id: z.string().uuid(),
});

export const getPostsByAuthorSchema = z.object({
	authorId: z.string().uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;
export type GetPostsByAuthorInput = z.infer<typeof getPostsByAuthorSchema>;