# MindKeep AI

A smart, Google Keep-inspired to-do application designed for both personal productivity and enterprise collaboration. MindKeep integrates Gemini AI to help organize tasks, break down complex projects, and provide insights into your productivity.

## Features

### Core Productivity
- **Smart Cards**: Organize tasks into colorful category cards (Kanban/Masonry style).
- **Drag & Drop**: Intuitive task management between categories and phases.
- **Timers**: Built-in focus timers for every task with Play/Pause/Stop functionality.
- **Deadlines**: Manage due dates for Categories, Phases (Enterprise), Tasks, and Sub-tasks.
- **Phases**: Enterprise users can organize categories into specific phases (e.g., Planning, Execution) with their own deadlines.
- **Dark Mode**: Fully supported system-wide dark mode.

### AI Integration (Gemini)
- **Auto-Breakdown**: One-click generation of sub-tasks for vague to-do items.
- **Category Planning**: Generate a starter list of tasks for new projects based on a simple description.
- **AI Chat Assistant**: Query your entire board using natural language (e.g., "What's due today?", "Summarize my work").

### Enterprise & Collaboration
- **Teams**: Create teams and manage members.
- **Attachments**: Add links and files to both Categories and individual Tasks.
- **In-Progress View**: Dedicated view for tasks that have started but aren't complete.

## Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google GenAI SDK (Gemini 2.5 Flash)
- **Icons**: Lucide React

## Setup
1. **Install dependencies**: `npm install`.
2. **Create your environment file**: copy `.env.example` to `.env` and set `GEMINI_API_KEY` plus any custom `DATABASE_URL`.
3. **Start Postgres**: `docker compose up -d postgres` boots the local database defined in `docker-compose.yml`.
4. **Run Prisma migrations**: `npm run prisma:migrate` applies the schema in `prisma/schema.prisma` and seeds the database structure (first run seeds using `20241120120000_init`).
5. **Generate the Prisma Client** (if you change the schema): `npm run prisma:generate`.
6. **Start the app**: `npm run dev`.

> Need to inspect or edit data quickly? Run `npm run prisma:studio` after the database is running.
