export enum ViewMode {
  BOARD = 'BOARD',
  TODAY = 'TODAY',
  TOMORROW = 'TOMORROW',
  UNSPECIFIED = 'UNSPECIFIED',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export interface SubTodo {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'file';
}

export interface Phase {
  id: string;
  title: string;
  deadline?: string; // ISO Date string
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Todo {
  id: string;
  categoryId: string;
  phaseId?: string; // Linked to a Phase within the Category
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: number;
  deadline?: string; // ISO Date string
  createdAt: number;
  
  // Timer Logic
  timeSpent: number; // in seconds
  timerState: TimerState;
  lastStartedAt?: number;

  // Premium/Enterprise
  subTodos: SubTodo[];
  assigneeIds: string[];
  attachments: Attachment[];
}

export interface Category {
  id: string;
  title: string;
  color: string; // Tailwind bg class e.g., "bg-red-100"
  description?: string;
  collaboratorIds: string[];
  isTeamSpace?: boolean;
  deadline?: string; // ISO Date string
  phases?: Phase[];
  attachments?: Attachment[];
  teamId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}