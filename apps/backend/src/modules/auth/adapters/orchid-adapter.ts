import type { db } from "@backend/db/db";
import type {
	AdapterFactoryCustomizeAdapterCreator,
	AdapterFactoryOptions,
	DBAdapter,
	DBAdapterDebugLogOption,
	Where,
} from "@better-auth/core/db/adapter";
import { createAdapterFactory } from "@better-auth/core/db/adapter";
import { BetterAuthError } from "@better-auth/core/error";
import type { BetterAuthOptions } from "better-auth";

export interface OrchidAdapterConfig {
	/**
	 * Enable debug logs for the adapter
	 *
	 * @default false
	 */
	debugLogs?: DBAdapterDebugLogOption | undefined;
}

export const orchidAdapter = (orchidDB: typeof db, config: OrchidAdapterConfig = {}) => {
	let lazyOptions: BetterAuthOptions | null = null;

		const createCustomAdapter =
			(): AdapterFactoryCustomizeAdapterCreator =>
			({ getFieldName }) => {
				// Override getFieldName to handle field mapping for sessions
				const customGetFieldName = ({ model, field }: { model: string; field: string }) => {
					// Map better-auth field names to our database field names
					if (model === "session") {
						const fieldMapping: Record<string, string> = {
							id: "sessionId",
							// token is already named correctly
							// userId is already named correctly
							// expiresAt is already named correctly
							// ipAddress is already named correctly
							// userAgent is already named correctly
							// createdAt is already named correctly
							// updatedAt is already named correctly
						};
						return fieldMapping[field] || field;
					}
					return getFieldName({ model, field });
				};
			function convertWhereClause(where: Where[], model: string) {
				if (!where || where.length === 0) return {};

				const whereObj: Record<string, any> = {};

				for (const w of where) {
					if (!w) continue;

					const field = customGetFieldName({ model, field: w.field });

					switch (w.operator) {
						case "in":
							if (!Array.isArray(w.value)) {
								throw new BetterAuthError(
									`The value for the field "${w.field}" must be an array when using the "in" operator.`,
								);
							}
							whereObj[field] = { in: w.value };
							break;
						case "not_in":
							if (!Array.isArray(w.value)) {
								throw new BetterAuthError(
									`The value for the field "${w.field}" must be an array when using the "not_in" operator.`,
								);
							}
							whereObj[field] = { notIn: w.value };
							break;
						case "contains":
							whereObj[field] = { contains: w.value };
							break;
						case "starts_with":
							whereObj[field] = { startsWith: w.value };
							break;
						case "ends_with":
							whereObj[field] = { endsWith: w.value };
							break;
						case "lt":
							whereObj[field] = { lt: w.value };
							break;
						case "lte":
							whereObj[field] = { lte: w.value };
							break;
						case "gt":
							whereObj[field] = { gt: w.value };
							break;
						case "gte":
							whereObj[field] = { gte: w.value };
							break;
						case "ne":
							whereObj[field] = { ne: w.value };
							break;
						default:
							whereObj[field] = w.value;
							break;
					}
				}

				return whereObj;
			}

			return {
				async create({ model, data: values }) {
					if(!(model === "session" || model === "user" || model === "account" || model === "verification")) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}
					// Map model names to table names
					const tableMap = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					// Auto-generate token for sessions if not provided
					if (model === "session" && !values.token) {
						// @ts-ignore - dynamic tables selected by model
						values.token = crypto.randomUUID();
					}

					const result = await table.create(values) as unknown as typeof values;
					return result;
				},

				async findOne({ model, where }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					const whereClause = convertWhereClause(where, model);

					// For sessions, exclude soft-deleted records
					if (model === "session") {
						whereClause.markedInvalidAt = null;
					}

					const result = await table.findOptional(whereClause);
					return result || null;
				},

				async findMany({ model, where, sortBy, limit, offset }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					let query = table.selectAll();

					if (where && where.length > 0) {
						const whereClause = convertWhereClause(where, model);
						query = query.where(whereClause);
					}

					// For sessions, exclude soft-deleted records
					if (model === "session") {
						query = query.where({ markedInvalidAt: null });
					}

					if (sortBy?.field) {
						const field = customGetFieldName({ model, field: sortBy.field });
						const direction = sortBy.direction === "desc" ? "DESC" : "ASC";
						query = query.order({ [field]: direction });
					}

					if (limit) {
						query = query.limit(limit);
					}

					if (offset) {
						query = query.offset(offset);
					}

					const result = await query;
					return result;
				},

				async count({ model, where }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					let query = table.selectAll();

					if (where && where.length > 0) {
						const whereClause = convertWhereClause(where, model);
						query = query.where(whereClause);
					}

					// For sessions, exclude soft-deleted records
					if (model === "session") {
						query = query.where({ markedInvalidAt: null });
					}

					const result = await query;
					return result.length;
				},

				async update({ model, where, update: values }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					const whereClause = convertWhereClause(where, model);
					const result = await table.findBy(whereClause).update(values);
					return result;
				},

				async updateMany({ model, where, update: values }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					let query = table.where({});

					if (where && where.length > 0) {
						const whereClause = convertWhereClause(where, model);
						query = query.where(whereClause);
					}

					const result = await query.update(values);
					return result;
				},

				async delete({ model, where }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					const whereClause = convertWhereClause(where, model);

					if (model === "session") {
						// Soft delete: set markedInvalidAt instead of hard delete
						await table.findBy(whereClause).update({
							markedInvalidAt: new Date(),
						});
					} else {
						// Hard delete for other models
						await table.findBy(whereClause).delete();
					}
					return;
				},

				async deleteMany({ model, where }) {
					const tableMap: Record<string, any> = {
						user: orchidDB.users,
						session: orchidDB.sessions,
						account: orchidDB.accounts,
						verification: orchidDB.verifications,
					};

					const table = tableMap[model];
					if (!table) {
						throw new BetterAuthError(`Unknown model: ${model}`);
					}

					let query = table.where({});

					if (where && where.length > 0) {
						const whereClause = convertWhereClause(where, model);
						query = query.where(whereClause);
					}

					if (model === "session") {
						// Soft delete: set markedInvalidAt instead of hard delete
						const result = await query.update({
							markedInvalidAt: new Date(),
						});
						return result;
					} else {
						// Hard delete for other models
						const result = await query.delete();
						return result;
					}
				},

				options: config,
			};
		};

	let adapterOptions: AdapterFactoryOptions | null = null;
	adapterOptions = {
		config: {
			adapterId: "orchid",
			adapterName: "Orchid ORM Adapter",
			usePlural: false,
			debugLogs: config.debugLogs ?? false,
			supportsUUIDs: true,
			supportsJSON: true,
			supportsArrays: true,
			transaction: false, // Orchid ORM doesn't have built-in transactions in the same way
		},
		adapter: createCustomAdapter(),
	};

	const adapter = createAdapterFactory(adapterOptions);
	return (options: BetterAuthOptions): DBAdapter<BetterAuthOptions> => {
		lazyOptions = options;
		return adapter(options);
	};
};