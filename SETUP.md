# tRPC + Orchid ORM Setup Guide

This project demonstrates a complete integration between tRPC and Orchid ORM with PostgreSQL, featuring centralized error handling and type-safe API routes.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd connected-repo-starter
   npm install
   ```

2. **Database Setup**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE connected_repo_db;
   ```

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=connected_repo_db
   ```

4. **Database Migration**
   
   Since this is a demo setup, you'll need to create the tables manually in your PostgreSQL database:
   
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Create users table
   CREATE TABLE "user" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email VARCHAR(255) UNIQUE NOT NULL,
       name VARCHAR(255) NOT NULL,
       created_at TIMESTAMPTZ DEFAULT now(),
       updated_at TIMESTAMPTZ DEFAULT now()
   );
   
   -- Create posts table
   CREATE TABLE post (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       title VARCHAR(255) NOT NULL,
       content TEXT NOT NULL,
       author_id UUID REFERENCES "user"(id),
       created_at TIMESTAMPTZ DEFAULT now(),
       updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

5. **Start Development Servers**
   
   Start both frontend and backend:
   ```bash
   # Terminal 1 - Backend
   cd apps/server
   npm run dev
   
   # Terminal 2 - Frontend  
   cd apps/frontend
   npm run dev
   ```

6. **Access the Demo**
   
   Navigate to `http://localhost:5173/demo` to see the tRPC + Orchid ORM integration in action.

## Features Demonstrated

### Backend (tRPC + Orchid ORM)

- **Database Schema**: User and Post entities with proper relations
- **tRPC Routes**: 
  - `user.getAll` - Get all users
  - `user.getById` - Get user by ID
  - `user.create` - Create new user
  - `post.getAll` - Get all posts with author info
  - `post.getById` - Get post by ID with author
  - `post.create` - Create new post
  - `post.getByAuthor` - Get posts by specific author

### Error Handling

- **Centralized Error Processing**: Custom TRPCError handling
- **Database Error Mapping**: Automatic conversion of DB errors to appropriate HTTP status codes
- **Validation**: Zod schema validation with formatted error responses
- **Error Formatting**: Structured error responses with detailed information

### Frontend (React + React Query)

- **Type-Safe API Calls**: Full TypeScript integration
- **Real-time Updates**: Automatic cache invalidation
- **Error Handling**: User-friendly error displays
- **Forms**: Create users and posts with validation

## Project Structure

```
apps/
├── server/src/
│   ├── db/
│   │   ├── config.ts          # Database connection config
│   │   ├── baseTable.ts       # Base table configuration
│   │   ├── db.ts              # Main ORM instance
│   │   └── tables/
│   │       ├── user.table.ts  # User table schema & validation
│   │       └── post.table.ts  # Post table schema & validation
│   ├── router.trpc.ts         # Main tRPC router with all routes
│   ├── trpc.ts                # tRPC setup with error handling
│   └── app.ts                 # Fastify app setup
└── frontend/src/
    ├── components/
    │   ├── UserList.tsx       # Display users
    │   ├── PostList.tsx       # Display posts
    │   ├── CreateUserForm.tsx # User creation form
    │   └── CreatePostForm.tsx # Post creation form
    └── pages/
        └── DatabaseDemo.tsx   # Main demo page
```

## Development Notes

### Database Queries with Orchid ORM

The project showcases various Orchid ORM patterns:

```typescript
// Simple select with specific fields
const users = await db.user.select({
  id: true,
  name: true,
  email: true,
});

// Queries with relations
const posts = await db.post.select({
  id: true,
  title: true,
  content: true,
  author: {
    id: true,
    name: true,
    email: true,
  },
});

// Filtered queries
const userPosts = await db.post
  .where({ authorId: userId })
  .order({ createdAt: "DESC" });
```

### Error Handling Examples

The system handles various error scenarios:

- **Validation Errors**: Zod schema failures
- **Database Constraints**: Unique key violations, foreign key errors
- **Not Found**: Missing records
- **Custom Business Logic**: Application-specific errors

## Troubleshooting

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check credentials in `.env` file
   - Ensure database exists

2. **Type Errors**
   - Restart TypeScript server in your IDE
   - Clear node_modules and reinstall if needed

3. **CORS Issues**
   - Update `ALLOWED_ORIGINS` in `.env`
   - Restart the server after changes

## Next Steps

To extend this demo:

1. Add user authentication
2. Implement database migrations
3. Add more complex relations
4. Include pagination
5. Add real-time subscriptions
6. Deploy to production

This setup provides a solid foundation for building type-safe, scalable applications with tRPC and Orchid ORM.