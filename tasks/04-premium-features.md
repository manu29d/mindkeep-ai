# Task 04: Premium Features Implementation

## Goal
Implement backend logic for Premium features: Sub-todos, Sharing, and AI Chat.

## Features

### 1. Sub-todos (Hierarchy)
- **Access Control**: Only allow if `user.tier` is `PREMIUM` or `ENTERPRISE`.
- **API Routes**:
  - **POST /api/todos/[id]/subtodos**: Create a sub-task.
  - **PUT /api/subtodos/[id]**: Update status/title.
  - **DELETE /api/subtodos/[id]**.

### 2. Basic Collaboration (Sharing)
- **Access Control**: Premium users can invite others.
- **Schema Change**: Ensure `Category` has a Many-to-Many relation with `User` named `collaborators`.
- **API Route**: `POST /api/categories/[id]/invite`
  - *Body*: `email`.
  - *Logic*: Find user by email. If exists, connect to `Category.collaborators`.
- **Update GET /api/categories**:
  - Modify query to fetch categories where `ownerId = user.id` OR `collaborators` contains `user.id`.

### 3. AI Chat & Breakdown (Gemini)
- **Access Control**: Check tier before calling Gemini.
- **Refactor `pages/api/gemini.ts`**:
  - **Action: Breakdown**:
    - Input: Todo title.
    - Output: List of sub-tasks.
    - *Logic*: Call Gemini, parse JSON, create `SubTodo` records in DB automatically.
  - **Action: Chat**:
    - Input: User query + Current Board Context (fetch all user's active todos).
    - Output: Text response.
    - *Optimization*: Only send relevant fields (title, deadline, status) to context window to save tokens.
