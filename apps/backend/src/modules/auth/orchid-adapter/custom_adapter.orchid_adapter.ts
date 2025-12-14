import { sql } from "@backend/db/base_table";
import { applyJoins } from "@backend/modules/auth/orchid-adapter/join_query_builder.orchid_adapter";
import { validateModel, validateSelect } from "@backend/modules/auth/orchid-adapter/model_table_map.orchid_adapter";
import { applyBetterAuthWhere } from "@backend/modules/auth/orchid-adapter/where_query_builder.orchid_adapter";
import type {
  AdapterFactoryCustomizeAdapterCreator
} from "@better-auth/core/db/adapter";

export const createCustomAdapterOrchid = (db: any): AdapterFactoryCustomizeAdapterCreator =>
  ({ getFieldName, options }) => ({
    create: async ({ model, data, select }) => {
      const modelName = validateModel(model);
      const validatedSelect = validateSelect(modelName, select);
      const result = await db[modelName]
        .create(data)
        .select(validatedSelect.join(", "));

      return result;
    },
    update: async ({ model, where, update: values }) => {
      const modelName = validateModel(model);
      const query = applyBetterAuthWhere(db[modelName], where);
      return await query.take().selectAll().update(values);
    },
    updateMany: async ({ model, where, update: values }) => {
      const modelName = validateModel(model);
      const query = applyBetterAuthWhere(db[modelName], where);
      return await query.selectAll().update(values);
    },
    delete: async ({ model, where }) => {
      const modelName = validateModel(model);
      const query = applyBetterAuthWhere(db[modelName], where);
      return await query.delete();
    },
    findOne: async ({ model, where, select, join }) => {
      const modelName = validateModel(model);
      const validatedSelect = validateSelect(modelName, select);
      let query = applyBetterAuthWhere(db[modelName], where);
      
      // Apply joins and get the select fields
      const { query: joinedQuery, selectFields } = applyJoins(query, join, db);
      
      // Combine main table select with joined table fields
      // If we have joins, use object syntax for selecting joined tables
      if (selectFields.length > 0) {
        const selectArgs = [validatedSelect.join(", "), ...selectFields];
        const finalQuery = joinedQuery.select(...selectArgs);
        return await finalQuery.takeOptional();
      }
      
      const finalQuery = joinedQuery.select(validatedSelect.join(", "));
      return await finalQuery.takeOptional();
    },
    findMany: async ({ model, where, sortBy, limit, offset, join }) => {
      const modelName = validateModel(model);
      let query = applyBetterAuthWhere(db[modelName], where);
      
      if (sortBy) {
        query = query.order({
          [sortBy.field]: sortBy.direction.toLowerCase() === "asc" ? "ASC" : "DESC",
        });
      }

      if (limit !== undefined) {
        query = query.limit(limit);
      }

      if (offset !== undefined) {
        query = query.offset(offset);
      }
      
      // Apply joins and get the select fields
      const { query: joinedQuery, selectFields } = applyJoins(query, join, db);
      
      // If we have joined tables, select main table + joined fields
      // Otherwise just select all from main table
      if (selectFields.length > 0) {
        return await joinedQuery.select("*", ...selectFields);
      }
      
      return await joinedQuery.selectAll();
    },
    count: ({ model, where }) => {
      const modelName = validateModel(model);
      let query = applyBetterAuthWhere(db[modelName], where);
      return query.count();
    },
    deleteMany: async ({ model, where }) => {
      const modelName = validateModel(model);
      const query = applyBetterAuthWhere(db[modelName], where);
      if( model === "sessions") {
        return await query.update({
          markedInvalidAt: sql`CURRENT_TIMESTAMP`
        })
      }
      return await query.delete();
    }
  });