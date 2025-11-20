import React, { createContext, useContext, useState, useEffect } from 'react';
import { Todo, Category, ViewMode, TimerState, Phase, Team } from '../types';
import { generateSubTodos, generateCategoryPlan } from '../services/geminiService';

interface TodoContextType {
  todos: Todo[];
  categories: Category[];
  teams: Team[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
  
  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Category Actions
  addCategory: (title: string, color: string, description?: string, deadline?: string, teamId?: string) => Promise<void>;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  moveCategory: (fromIndex: number, toIndex: number) => void;
  addPhase: (categoryId: string, title: string, deadline?: string) => void;
  
  // Todo Actions
  addTodo: (categoryId: string, title: string, phaseId?: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (todoId: string, targetCategoryId: string, targetPhaseId?: string) => void;
  
  // Timer Actions
  toggleTimer: (todoId: string) => void;
  stopTimer: (todoId: string) => void;

  // Team Actions
  addTeam: (name: string) => void;
  addTeamMember: (teamId: string, name: string, role: string) => void;

  // AI Actions
  enrichTodoWithAI: (todoId: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_CATEGORIES: Category[] = [
  { 
    id: 'c1', 
    title: 'Work Projects', 
    color: 'bg-blue-100 dark:bg-blue-900/40', 
    collaboratorIds: [],
    phases: [
      { id: 'p1', title: 'Q1 Planning', deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString() }
    ],
    attachments: []
  },
  { id: 'c2', title: 'Personal', color: 'bg-green-100 dark:bg-green-900/40', collaboratorIds: [], attachments: [] },
  { id: 'c3', title: 'Urgent', color: 'bg-red-100 dark:bg-red-900/40', collaboratorIds: [], attachments: [] },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team1',
    name: 'Marketing',
    members: [
      { id: 'm1', name: 'Jane Doe', role: 'Lead', avatar: 'JD' },
      { id: 'm2', name: 'John Smith', role: 'Designer', avatar: 'JS' }
    ]
  }
];

const INITIAL_TODOS: Todo[] = [
  {
    id: 't1', categoryId: 'c1', phaseId: 'p1', title: 'Prepare Q3 Report', completed: false, createdAt: Date.now(),
    timeSpent: 0, timerState: TimerState.IDLE, subTodos: [], assigneeIds: [], attachments: [],
    deadline: new Date().toISOString()
  },
  {
    id: 't2', categoryId: 'c2', title: 'Buy Groceries', completed: false, createdAt: Date.now(),
    timeSpent: 120, timerState: TimerState.IDLE, subTodos: [], assigneeIds: [], attachments: [],
    deadline: new Date().toISOString()
  }
];

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.BOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Filter State
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Dark Mode Class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Timer Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTodos(currentTodos => 
        currentTodos.map(todo => {
          if (todo.timerState === TimerState.RUNNING) {
            return { ...todo, timeSpent: todo.timeSpent + 1 };
          }
          return todo;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addCategory = async (title: string, color: string, description?: string, deadline?: string, teamId?: string) => {
    const newCat: Category = {
      id: crypto.randomUUID(),
      title,
      color,
      description,
      collaboratorIds: [],
      deadline,
      phases: [],
      attachments: [],
      teamId: teamId || (activeTeamId || undefined)
    };
    setCategories(prev => [...prev, newCat]);

    if (description && description.trim().length > 0) {
       // AI Generation for new category
       const generatedTitles = await generateCategoryPlan(title, description);
       const defaultDeadline = deadline || new Date().toISOString();

       const newTodos = generatedTitles.map(t => ({
         id: crypto.randomUUID(),
         categoryId: newCat.id,
         title: t,
         completed: false,
         createdAt: Date.now(),
         timeSpent: 0,
         timerState: TimerState.IDLE,
         subTodos: [],
         assigneeIds: [],
         attachments: [],
         deadline: defaultDeadline
       }));
       setTodos(prev => [...prev, ...newTodos]);
    }
  };

  const addPhase = (categoryId: string, title: string, deadline?: string) => {
    const newPhase: Phase = { id: crypto.randomUUID(), title, deadline };
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return { ...c, phases: [...(c.phases || []), newPhase] };
      }
      return c;
    }));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTodos(prev => prev.filter(t => t.categoryId !== id));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  
  const moveCategory = (fromIndex: number, toIndex: number) => {
    setCategories(prev => {
      const newCats = [...prev];
      const [moved] = newCats.splice(fromIndex, 1);
      newCats.splice(toIndex, 0, moved);
      return newCats;
    });
  };

  const addTodo = (categoryId: string, title: string, phaseId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    
    // Default deadline logic: Copy from category deadline if it exists, else today.
    let deadline = category?.deadline;
    if (!deadline) {
        const today = new Date();
        deadline = today.toISOString();
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      categoryId,
      phaseId,
      title,
      completed: false,
      createdAt: Date.now(),
      timeSpent: 0,
      timerState: TimerState.IDLE,
      subTodos: [],
      assigneeIds: [],
      attachments: [],
      deadline // Set derived deadline
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const moveTodo = (todoId: string, targetCategoryId: string, targetPhaseId?: string) => {
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, categoryId: targetCategoryId, phaseId: targetPhaseId } : t));
  };

  const toggleTimer = (todoId: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== todoId) return t;
      
      // Allow starting from IDLE, PAUSED, or STOPPED (if re-opened)
      if (t.timerState === TimerState.IDLE || t.timerState === TimerState.PAUSED || t.timerState === TimerState.STOPPED) {
        return { ...t, timerState: TimerState.RUNNING, lastStartedAt: Date.now() };
      } else if (t.timerState === TimerState.RUNNING) {
        return { ...t, timerState: TimerState.PAUSED };
      }
      return t;
    }));
  };

  const stopTimer = (todoId: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== todoId) return t;
      return { ...t, timerState: TimerState.STOPPED, completed: true, completedAt: Date.now() };
    }));
  };

  const enrichTodoWithAI = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    const subtasks = await generateSubTodos(todo.title, todo.description);
    const subTodoObjects = subtasks.map(st => ({
      id: crypto.randomUUID(),
      title: st,
      completed: false
    }));

    updateTodo(todoId, { subTodos: [...todo.subTodos, ...subTodoObjects] });
  };

  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name,
      members: []
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const addTeamMember = (teamId: string, name: string, role: string) => {
    const member: any = { id: crypto.randomUUID(), name, role, avatar: name.substring(0, 2).toUpperCase() };
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...t.members, member] } : t));
  };

  return (
    <TodoContext.Provider value={{
      todos, categories, teams, viewMode, setViewMode,
      isDarkMode, toggleDarkMode,
      searchQuery, setSearchQuery, activeTeamId, setActiveTeamId,
      addCategory, deleteCategory, updateCategory, moveCategory, addPhase,
      addTodo, updateTodo, deleteTodo, moveTodo,
      toggleTimer, stopTimer, enrichTodoWithAI,
      addTeam, addTeamMember
    }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodo must be used within TodoProvider");
  return context;
};