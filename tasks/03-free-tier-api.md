# Task 03: Free Tier API (Core Features)

## Goal
Implement the backend API routes for the core functionality available to all users (Free Tier).

## API Routes

### Categories (`pages/api/categories/index.ts`, `[id].ts`)
- **GET /api/categories**: Fetch all categories owned by the current user.
- **POST /api/categories**: Create a new category.
  - *Validation*: Ensure `title` exists. Default `color` if missing.
- **PUT /api/categories/[id]**: Update title or color.
- **DELETE /api/categories/[id]**: Delete category (cascade delete todos?).

### Todos (`pages/api/todos/index.ts`, `[id].ts`)
- **GET /api/todos**: Fetch todos.
  - *Query Params*: `view` (today, tomorrow, completed), `categoryId`.
- **POST /api/todos**: Create a todo.
  - *Body*: `title`, `categoryId`, `deadline`.
- **PUT /api/todos/[id]**: Update todo.
  - Support moving between categories (`categoryId` update).
  - Support status change (`completed`).
  - Support timer updates (`timerState`, `timeSpent`).
- **DELETE /api/todos/[id]**: Delete todo.

### Timer Logic
- The timer state is managed optimistically on the frontend but must be persisted.
- **PUT /api/todos/[id]/timer**: (Optional specific endpoint)
  - Update `timerState`, `lastStartedAt`, `timeSpent`.
  - When stopping, calculate final `timeSpent` and set `completed = true`.

## Data Access
- All queries must use `req.session.user.id` to ensure users only access their own data.
- Example: `prisma.category.findMany({ where: { ownerId: session.user.id } })`.
