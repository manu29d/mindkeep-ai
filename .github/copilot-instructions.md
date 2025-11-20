# Copilot Instructions for MindKeep AI

## Project Overview
MindKeep AI is a Google Keep-inspired productivity app built with React 19, TypeScript, and Tailwind CSS. It features smart Kanban-style boards, AI-powered task breakdowns, and enterprise collaboration tools. Gemini AI (Google GenAI SDK) is integrated for natural language task management and planning.

## Architecture & Key Components
- **Frontend**: All UI logic is in React components under `components/` and `pages/`.
  - `CategoryBoard.tsx`: Kanban/masonry board for organizing tasks by category.
  - `TodoItem.tsx`: Individual task cards, including timer and status logic.
  - `AIChat.tsx`: Chat interface for interacting with Gemini AI.
  - `Sidebar.tsx`: Navigation and board controls.
- **Context**: State management via React Context in `context/TodoContext.tsx`.
- **Services**: AI integration logic in `services/geminiService.ts` and API route in `pages/api/gemini.ts`.
- **Styling**: Tailwind CSS, configured in `tailwind.config.cjs` and `postcss.config.cjs`.

## Functional Requirements & Patterns
- **Board & Category Management**: Users create categories (columns/cards) with customizable colors (auto-adapt to dark mode). Enterprise users subdivide categories into "Phases" (e.g., Sprint 1, Q1), each with deadlines.
- **Task Management**: Tasks support CRUD, drag-and-drop between categories/phases, nested sub-tasks, attachments, and deadline inheritance (from category, else today).
- **Timer Logic**: Each task has a timer with states (Idle, Running, Paused, Stopped). Stopping marks complete; restarting is allowed if unchecked. Timer state syncs with context.
- **AI Features**: Use Gemini for auto-breakdown (3-5 actionable sub-tasks), project planning (starter tasks for new category), and contextual chat (answers based on board state).
- **Views**: Kanban board, temporal (Today/Tomorrow), status (In Progress, Completed, Unspecified), and team management modal.
- **Collaboration**: Teams and mock members (avatars) managed in context.
- **UI/UX**: "Inter" font, rounded corners, smooth transitions, robust dark/light mode, mobile-friendly (columns stack), instant drag/timer interactions.

## Developer Workflows
- **Start Dev Server**: `npm run dev` (uses Vite)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **No formal test suite**: No test runner or test files detected; focus on manual and UI-driven validation.
- **Environment**: Requires `.env` with `API_KEY` for Gemini.

## Patterns & Conventions
- **Task Data**: Tasks, categories, and phases are managed in context and passed as props. Use TypeScript types from `types.ts`.
- **AI Calls**: Use `geminiService.ts` for all Gemini API interactions. The API route in `pages/api/gemini.ts` proxies requests for security.
- **Component Structure**: Prefer functional components and hooks. State is lifted to context where possible.
- **Drag & Drop**: Implemented in `CategoryBoard.tsx` using React DnD patterns.
- **Timers**: Task timers are managed per `TodoItem.tsx` and synced with context.
- **Dark Mode**: Controlled via Tailwind and system settings.

## Integration Points
- **Gemini AI**: All AI features (auto-breakdown, chat, planning) use Gemini via `geminiService.ts`.
- **Enterprise Features**: Phases, teams, and attachments are managed in context and component props.

## Examples
- To add a new AI feature, extend `geminiService.ts` and update `AIChat.tsx`.
- For new board views, modify `CategoryBoard.tsx` and update context logic.
- To support new task metadata, update `types.ts` and context state.

## References
- `README.md`: High-level feature and setup overview
- `components/`, `context/`, `services/`: Main code locations
- `tailwind.config.cjs`, `postcss.config.cjs`: Styling conventions

---
_Review and update this file as new features, workflows, or conventions emerge._
