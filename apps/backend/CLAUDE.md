- Always use database time for any date/time related operations. Dont use javascript date object.
- Dont create migration files manually. Migration files are generated automatically by 
```bash
yarn db g <migration-name>
```