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
		(orchidDB: typeof db): AdapterFactoryCustomizeAdapterCreator =>
		({ getFieldName, options }) => {
			function convertWhereClause(where: Where[], model: string) {
				if (!where || where.length === 0) return {};

				const whereObj: Record<string, any> = {};

				for (const w of where) {
					if (!w) continue;

					const field = getFieldName({ model, field: w.field });

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
					// Map model names to table names
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

					const result = await table.create(values);
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

					if (sortBy?.field) {
						const field = getFieldName({ model, field: sortBy.field });
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
					await table.findBy(whereClause).delete();
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

					const result = await query.delete();
					return result;
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
		adapter: createCustomAdapter(orchidDB),
	};

	const adapter = createAdapterFactory(adapterOptions);
	return (options: BetterAuthOptions): DBAdapter<BetterAuthOptions> => {
		lazyOptions = options;
		return adapter(options);
	};
};