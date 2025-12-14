import { Db } from "@backend/db/db";
import { ModelName } from "@backend/modules/auth/orchid-adapter/model_table_map.orchid_adapter";
import { type Where } from "better-auth";

/**
 * Maps better-auth operators to Orchid ORM operators.
 */
const operatorMap: Record<string, string> = {
  ne: 'not',
  lt: 'lt',
  lte: 'lte',
  gt: 'gt',
  gte: 'gte',
  in: 'in',
  not_in: 'notIn',
  contains: 'contains',       // LIKE '%value%'
  starts_with: 'startsWith',  // LIKE 'value%'
  ends_with: 'endsWith',      // LIKE '%value'
};

/**
 * Applies better-auth Where clauses to an Orchid ORM query builder.
 */
export function applyBetterAuthWhere(query: Db[ModelName], whereClauses: Where[] | undefined = []): any {
  let queryWithWhere = query;
  for (const clause of whereClauses) {
    const { field, value, operator = "eq", connector = "AND" } = clause;
    
    // 1. Build the Orchid-compatible condition object
    let condition: Record<string, any> = {};

    if (operator === "eq") {
      // Orchid handles direct assignment as equality: .where({ id: 1 })
      condition[field] = value;
    } else {
      const orchidOp = operatorMap[operator];
      if (orchidOp) {
        // Other operators use the nested object syntax: .where({ age: { gt: 18 } })
        condition[field] = { [orchidOp]: value };
      } else {
        // Fallback for unknown operators (safety check), defaulting to equality
        condition[field] = value;
      }
    }

    // 2. Apply to the query based on the connector
    // Orchid methods: .where() for AND, .orWhere() for OR
    queryWithWhere = connector === "OR" ? query.orWhere(condition) :  query.where(condition);
  }

  return queryWithWhere;
}