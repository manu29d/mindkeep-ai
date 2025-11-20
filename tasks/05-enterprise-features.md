# Task 05: Enterprise Features Implementation

## Goal
Implement backend logic for Enterprise features: Teams, Phases, and Advanced AI Planning.

## Features

### 1. Team Management
- **Access Control**: `ENTERPRISE` only.
- **API Routes**:
  - **POST /api/teams**: Create a team.
  - **POST /api/teams/[id]/members**: Add user to team.
  - **GET /api/teams**: List user's teams.
- **Logic**:
  - Categories can be assigned to a `Team` instead of just a user.
  - Update `GET /api/categories` to also include categories belonging to teams the user is a member of.

### 2. Phases
- **Access Control**: `ENTERPRISE` only.
- **API Routes**:
  - **POST /api/categories/[id]/phases**: Create a phase (e.g., "Q1", "Sprint 1").
  - **PUT /api/todos/[id]**: Allow assigning `phaseId`.
- **Logic**:
  - Validate that the `phaseId` belongs to the `categoryId` of the todo.

### 3. Multiple Assignments
- **Schema**: `Todo` has `assignees` (User[]).
- **API**: Update `PUT /api/todos/[id]` to handle `assigneeIds` array.

### 4. AI Category Planning
- **Endpoint**: `POST /api/ai/plan`
- **Input**: Category Title, Description.
- **Logic**:
  - Call Gemini to generate a list of tasks.
  - Create `Todo` records in the database for that category.
