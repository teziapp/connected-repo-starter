- Always use database time for any date/time related operations. Dont use javascript date object.
- Dont create migration files manually. Migration files are generated automatically by 
```bash
yarn db g <migration-name>
```

- Interpolating values in template literals is safe from SQL injections:
// get value from user-provided params
const { value } = req.params;

// SQL injection is prevented by a library, this is safe:
await db.table.whereSql`column = ${value}`;

- fastify-zod-openapi automatically provides types & handles validation, serialization and @fastify/swagger support for zod-openapi.