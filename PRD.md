# Product Requirements Document (PRD) - MindKeep AI

## 1. Overview
MindKeep AI is a modern task management application blending the visual simplicity of sticky notes (Google Keep) with the structured power of project management tools (Jira/Trello) and the intelligence of Generative AI.

## 2. Target Audience
- **Free Tier**: Individuals, Students, Freelancers needing visual organization.
- **Premium/Enterprise**: Teams, Project Managers, and Power Users requiring breakdown structures, time tracking, and collaboration.

## 3. Functional Requirements

### 3.1. Board & Category Management
- Users can create Categories (columns/cards).
- **Styling**: Users can change the background color of categories. Colors must adapt to Dark Mode automatically.
- **Phases (Enterprise)**: Categories can be subdivided into "Phases" (e.g., Sprint 1, Q1).
- **Deadlines**: Categories and Phases can have specific deadlines.

### 3.2. Task Management (To-Do)
- **CRUD**: Create, Read, Update, Delete tasks.
- **Drag & Drop**: Move tasks between Categories and Phases.
- **Sub-tasks**: Tasks can contain nested sub-tasks with their own deadlines.
- **Attachments**: Support for adding URLs/Files to tasks.
- **Deadlines**: Default deadline is inherited from the Category; otherwise defaults to Today.

### 3.3. Time Tracking
- **States**: Idle, Running, Paused, Stopped.
- **Action**: Clicking "Stop" automatically marks the task as Complete.
- **Restart**: Users must be able to restart a timer even after a task is marked complete (if they uncheck it).

### 3.4. AI Features (Gemini Integration)
- **Task Breakdown**: Analyze a task title/description and generate 3-5 actionable sub-tasks.
- **Project Planning**: Generate initial tasks for a new Category based on a user description.
- **Contextual Chat**: A sidebar chat interface that has read-access to the user's current board state to answer questions like "What should I work on next?".

### 3.5. Views & Navigation
- **Board View**: Main Kanban-style view.
- **Temporal Views**: Today, Tomorrow.
- **Status Views**: In Progress (Started or Subtasks done), Completed, Unspecified (No deadline).
- **Team View**: Management modal for teams.

### 3.6. Collaboration
- **Teams**: Create generic teams.
- **Members**: Add "Mock" members to teams with avatars.

## 4. Non-Functional Requirements
- **UI/UX**: Clean, "Inter" font, rounded corners, smooth transitions.
- **Responsiveness**: Mobile-friendly layout (stack columns).
- **Theme**: Robust Dark/Light mode toggle.
- **Performance**: Instant interactions for drag-and-drop and timer toggles.

## 5. Future Scope
- Real-time database integration (Firebase/Supabase).
- Drag-and-drop for reordering phases.
- Calendar Grid View.
- Export reports to PDF/CSV.
