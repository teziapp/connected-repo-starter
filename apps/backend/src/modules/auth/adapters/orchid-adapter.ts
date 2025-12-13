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
					if (field === "id") {
						if (model === "user") return "userId";
						if (model === "session") return "sessionId";
						if (model === "account") return "accountId";
						if (model === "verification") return "id";
					}
					if (model === "session") {
						const fieldMapping: Record<string, string> = {
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
					if (!w || w.value === undefined) continue;

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
							whereObj.NOT[field] = w.value;
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
					console.log(`Creating record in model: ${model} with values:`, values);
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

					// For sessions, populate user info
					if (model === "session" && values.userId) {
						const user = await orchidDB.users.findBy({ userId: values.userId });
						if (user) {
							values.email = user.email;
							values.name = user.name;
							values.displayPicture = user.displayPicture;
						}
					}

					// Map id to the correct field for creation
					if (model === "user" && values.id !== undefined) {
						values.userId = values.id;
						delete values.id;
					} else if (model === "session" && values.id !== undefined) {
						values.sessionId = values.id;
						delete values.id;
					} else if (model === "account" && values.id !== undefined) {
						values.accountId = values.id;
						delete values.id;
					}

					// Don't set userId for user creation if undefined, let default generate it
					if (model === "user" && values.userId === undefined) {
						delete values.userId;
					}

					const result = await table.create(values);
					console.log("Created record:", result);

					// Map back to better-auth expected format
					if (model === "user") {
						const userResult = {
							id: result.userId,
							email: result.email,
							name: result.name,
							image: result.displayPicture,
							createdAt: result.createdAt,
							updatedAt: result.updatedAt,
						};
						console.log('Returning user:', userResult);
						return userResult;
					} else if (model === "session") {
						return {
							id: result.sessionId,
							...result,
						};
					} else if (model === "account") {
						console.log('Creating account with userId:', values.userId);
						const accountResult = {
							id: result.accountId,
							...result,
						};
						console.log('Returning account:', accountResult);
						return accountResult;
					} else if (model === "verification") {
						return {
							id: result.id,
							...result,
						};
					}

					return result;
				},

				async findOne({ model, where }) {
					console.log('Finding one record in model:', model, 'with where:', where);
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

					console.log('Finding record in model:', model, 'with where:', whereClause);
					const result = await table.where(whereClause).takeOptional();
					console.log('Found record:', result);

					if (result) {
						if (model === "user") {
							return {
								id: result.userId,
								email: result.email,
								name: result.name,
								image: result.displayPicture,
								createdAt: result.createdAt,
								updatedAt: result.updatedAt,
							};
						} else if (model === "session") {
							return {
								id: result.sessionId,
								...result,
							};
						} else if (model === "account") {
							return {
								id: result.accountId,
								...result,
							};
						} else if (model === "verification") {
							return {
								id: result.id,
								...result,
							};
						}
					}

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
					const result = await table.where(whereClause).update(values);
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
						await table.where(whereClause).update({
							markedInvalidAt: new Date(),
						});
					} else {
						// Hard delete for other models
						await table.where(whereClause).delete();
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