
type JoinConfig = {
  [model: string]: {
    /**
     * The joining column names.
     */
    on: {
      /**
       * Column name from the main table
       */
      from: string;
      /**
       * Column name from the joined table
       */
      to: string;
    };
    /**
     * Limit the number of rows to return.
     *
     * If the relation has `unique` constraint, then this option will be ignored and limit will be set to 1.
     *
     * @default 100
     */
    limit?: number;
    /**
     * The relation type. Determines the output joined model data.
     *
     * `one-to-one` would have a single object in the output.
     * `one-to-many` would have an array of objects in the output.
     * `many-to-many` would have an array of objects in the output.
     *
     * @default "one-to-many"
     */
    relation?: "one-to-one" | "one-to-many" | "many-to-many";
  };
};

/**
 * Applies better-auth JoinConfig to an Orchid ORM query.
 * @param query The current Orchid ORM query builder instance.
 * @param joinConfig The join configuration from better-auth.
 * @param db The Orchid ORM database instance (or a map of model names to Table objects).
 * @returns An object with the modified query and select objects for joined tables
 */
export function applyJoins(
  query: any, 
  joinConfig: JoinConfig | undefined,
  db: Record<string, any>
): { query: any; selectFields: Record<string, string>[] } {
  if(!joinConfig) {
    return { query, selectFields: [] };
  }
  let joinQuery = query;
  const selectFields: Record<string, string>[] = [];
  
  for (const [modelName, config] of Object.entries(joinConfig)) {
    const targetTable = db[modelName];
    
    if (!targetTable) {
      console.warn(`[better-auth-orchid] Model '${modelName}' not found in db instance. Skipping join.`);
      continue;
    }

    const { on, limit, relation } = config;
    
    // 'on.from' is the column in the main table
    // 'on.to' is the column in the joined table
    // Orchid syntax: .join(TargetTable, 'targetColumn', 'sourceColumn')
    
    // CASE 1: One-to-One relation - use standard left join
    if (relation === 'one-to-one') {
      // Use leftJoin to preserve main records even if relation is empty
      // Syntax: .leftJoin(Table, 'table.col', 'main.col')
      joinQuery = joinQuery.leftJoin(
        targetTable,
        on.to,
        on.from
      );
      
      // Add joined table fields to select list as an object
      // According to Orchid ORM docs, use { modelName: 'tableName.*' } syntax
      selectFields.push({ [modelName]: `${modelName}.*` });
    }
    
    // CASE 2: One-to-Many or Many-to-Many - use lateral join with limit
    else {
      // Apply LEFT JOIN LATERAL with limit
      joinQuery = joinQuery.leftJoinLateral(
        targetTable,
        (q: any) => q.on(on.to, on.from).limit(limit || 100)
      );
      
      // Add joined table fields to select list as an object
      selectFields.push({ [modelName]: `${modelName}.*` });
    }
  }

  return { query: joinQuery, selectFields };
}