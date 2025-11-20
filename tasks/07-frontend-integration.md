# Task 07: Frontend Integration & State Refactor

## Goal
Refactor `TodoContext.tsx` to replace local state management with API calls and React Query (or SWR) for data fetching.

## Steps

### 1. Install Data Fetching Library
- `npm install swr` or `@tanstack/react-query`.
- *Recommendation*: `swr` is simpler for Next.js.

### 2. Refactor `TodoContext`
- **Remove**: `useState` for `todos`, `categories`.
- **Add**: `useSWR` hooks to fetch data.
  ```typescript
  const { data: categories } = useSWR('/api/categories', fetcher);
  const { data: todos } = useSWR('/api/todos', fetcher);
  ```

### 3. Implement Mutations
- Replace `addTodo`, `updateTodo`, `deleteTodo` functions.
- Instead of `setTodos(...)`, call `await fetch('/api/todos', ...)` and then `mutate('/api/todos')` to refresh data.

### 4. Optimistic Updates (Optional but Recommended)
- For Drag & Drop and Timers, the UI must be instant.
- Use SWR's `mutate` with optimistic data to update the UI immediately while the API request processes in the background.

### 5. Loading States
- Handle `isLoading` states in the UI (show skeletons or spinners) while fetching initial data.
