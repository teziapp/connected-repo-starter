import { z } from "zod";
import { BaseTable } from "../base_table";

export class UserTable extends BaseTable {
	readonly table = "user";
	
	columns = this.setColumns((t) => ({
		id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		email: t.string().unique(),
		name: t.string(),
		createdAt: t.timestamp().default(t.sql`now()`),
		updatedAt: t.timestamp().default(t.sql`now()`),
	}));
}

// Zod schemas for validation
export const createUserSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1, "Name is required"),
});

export const getUserByIdSchema = z.object({
	id: z.string().uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;