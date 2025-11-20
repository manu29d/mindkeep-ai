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
1. Clone the repository.
2. Create a `.env` file with your Google Gemini API Key: `API_KEY=your_key_here`.
3. Install dependencies (if using a local bundler, though this is set up for ES Modules in browser).
4. Run the application.
