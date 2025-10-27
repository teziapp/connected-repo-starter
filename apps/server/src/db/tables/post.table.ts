import { z } from "zod";
import { BaseTable } from "@server/db/base_table";

export class PostTable extends BaseTable {
	readonly table = "post";

	columns = this.setColumns((t) => ({
		id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		title: t.string(),
		content: t.text(),
		authorId: t.uuid().foreignKey("user", "id", {
			onDelete: "CASCADE",
			onUpdate: "RESTRICT"
		}),
		...t.timestamps(),
	}));

	relations = {
		author: this.belongsTo(() => UserTable, {
			columns: ["authorId"],
			references: ["id"],
		}),
	};
}

// Import UserTable after the PostTable definition to avoid circular imports
import { UserTable } from "@server/db/tables/user.table";

// Zod schemas for validation
export const createPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	authorId: z.string().uuid(),
});

export const getPostByIdSchema = z.object({
	id: z.uuid(),
});

export const getPostsByAuthorSchema = z.object({
	authorId: z.uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;
export type GetPostsByAuthorInput = z.infer<typeof getPostsByAuthorSchema>;
