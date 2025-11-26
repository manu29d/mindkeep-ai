import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Todo, Category, ViewMode, TimerState, Phase, Team, Invitation } from '../types';
import { generateSubTodos, generateCategoryPlan } from '../services/geminiService';

const fetcher = async (url: string) => {
  console.log('Fetcher called for:', url);
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('API request failed');
    console.error(`Fetcher error for ${url}:`, res.status, res.statusText);
    throw error;
  }
  const data = await res.json();
  console.log(`Fetcher response for ${url}:`, Array.isArray(data) ? `Array(${data.length})` : data);
  return data;
};

interface TodoContextType {
  todos: Todo[];
  categories: Category[];
  teams: Team[];
  invitations: Invitation[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isLoading: boolean;
  
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
  addTodo: (categoryId: string, title: string, phaseId?: string, description?: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (todoId: string, targetCategoryId: string, targetPhaseId?: string) => void;
  
  // Timer Actions
  toggleTimer: (todoId: string) => void;
  stopTimer: (todoId: string) => void;

  // Team Actions
  addTeam: (name: string) => Promise<any>;
  addTeamMember: (teamId: string, name: string, role: string) => Promise<any>;

  // Invitation Actions
  respondToInvitation: (invitationId: string, action: 'accept' | 'reject') => void;

  // AI Actions
  enrichTodoWithAI: (todoId: string) => Promise<void>;

  // User Preferences
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string | null) => void;

  // Ordering
  todoOrder: Record<string, string[]>;
  reorderTodo: (containerId: string, newOrder: string[]) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.BOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string | null>(null);
  const [todoOrder, setTodoOrder] = useState<Record<string, string[]>>({});

  // Load API Key from LocalStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) setGeminiApiKeyState(storedKey);
    
    const storedOrder = localStorage.getItem('todoOrder');
    if (storedOrder) {
        try {
            setTodoOrder(JSON.parse(storedOrder));
        } catch (e) {
            console.error("Failed to parse todo order", e);
        }
    }
  }, []);

  const setGeminiApiKey = (key: string | null) => {
    setGeminiApiKeyState(key);
    if (key) {
      localStorage.setItem('geminiApiKey', key);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
  };
  
  // Filter State
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // SWR Data Fetching
  const { data: categoriesData, error: catError } = useSWR<Category[]>('/api/categories', fetcher);
  const { data: todosData, error: todoError } = useSWR<Todo[]>('/api/todos', fetcher);
  const { data: teamsData, error: teamError } = useSWR<Team[]>('/api/teams', fetcher);
  const { data: invitationsData, error: invError } = useSWR<Invitation[]>('/api/invitations', fetcher);

  // Debug logging
  useEffect(() => {
    console.log('SWR Status:', {
      categories: { data: categoriesData?.length, error: catError?.message },
      todos: { data: todosData?.length, error: todoError?.message, raw: todosData },
      teams: { data: teamsData?.length, error: teamError?.message },
      invitations: { data: invitationsData?.length, error: invError?.message }
    });
  }, [categoriesData, todosData, teamsData, invitationsData, catError, todoError, teamError, invError]);

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const todos = Array.isArray(todosData) ? todosData : [];
  const teams = Array.isArray(teamsData) ? teamsData : [];
  const invitations = Array.isArray(invitationsData) ? invitationsData : [];
  
  console.log('Context arrays:', {
    categoriesData: { isArray: Array.isArray(categoriesData), value: categoriesData },
    todosData: { isArray: Array.isArray(todosData), value: todosData },
    categories: categories.length,
    todos: todos.length
  });

  const isLoading = (!categoriesData && !catError) || (!todosData && !todoError) || (!teamsData && !teamError) || (!invitationsData && !invError);

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
      mutate('/api/todos', (currentTodos: Todo[] | undefined) => {
        // Don't mutate if we don't have data yet
        if (!currentTodos || !Array.isArray(currentTodos)) {
          console.log('Timer tick - skipping, no data yet');
          return currentTodos;
        }
        
        console.log('Timer tick - currentTodos:', currentTodos.length);
        return currentTodos.map(todo => {
          if (todo.timerState === TimerState.RUNNING) {
            return { ...todo, timeSpent: (todo.timeSpent || 0) + 1 };
          }
          return todo;
        });
      }, false);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addCategory = async (title: string, color: string, description?: string, deadline?: string, teamId?: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color, description, deadline, teamId })
      });
      if (!res.ok) throw new Error('Failed to create category');
      const newCat = await res.json();
      mutate('/api/categories');

      if (description && description.trim().length > 0) {
         // AI Generation for new category
         const generatedTodos = await generateCategoryPlan(title, description);
         
         for (const t of generatedTodos) {
            await addTodo(newCat.id, t.title, undefined, t.description);
         }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addPhase = async (categoryId: string, title: string, deadline?: string) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}/phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, deadline })
      });
      if (!res.ok) throw new Error('Failed to create phase');
      mutate('/api/categories');
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      mutate('/api/categories', (categories: Category[] | undefined) => categories?.filter(c => c.id !== id), false);
      mutate('/api/todos', (todos: Todo[] | undefined) => todos?.filter(t => t.categoryId !== id), false);

      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      
      mutate('/api/categories');
      mutate('/api/todos');
    } catch (error) {
      console.error(error);
      mutate('/api/categories');
      mutate('/api/todos');
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      mutate('/api/categories', (categories: Category[] | undefined) => 
        categories?.map(c => c.id === id ? { ...c, ...updates } : c), false);

      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update category');
      
      mutate('/api/categories');
    } catch (error) {
      console.error(error);
      mutate('/api/categories');
    }
  };
  
  const moveCategory = (fromIndex: number, toIndex: number) => {
    // Local only for now as backend doesn't support ordering
    mutate('/api/categories', (categories: Category[] | undefined) => {
      if (!categories) return [];
      const newCats = [...categories];
      const [moved] = newCats.splice(fromIndex, 1);
      newCats.splice(toIndex, 0, moved);
      return newCats;
    }, false);
  };

  const reorderTodo = (containerId: string, newOrder: string[]) => {
    setTodoOrder(prev => {
        const next = { ...prev, [containerId]: newOrder };
        localStorage.setItem('todoOrder', JSON.stringify(next));
        return next;
    });
  };

  const addTodo = async (categoryId: string, title: string, phaseId?: string, description?: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      let deadline = category?.deadline;

      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, title, phaseId, deadline, description })
      });
      if (!res.ok) throw new Error('Failed to create todo');
      
      mutate('/api/todos');
    } catch (error) {
      console.error(error);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      // Optimistic update
      mutate('/api/todos', (todos: Todo[] | undefined) => 
        todos?.map(t => t.id === id ? { ...t, ...updates } : t), false);

      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update todo');
      
      mutate('/api/todos');
    } catch (error) {
      console.error(error);
      mutate('/api/todos');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      mutate('/api/todos', (todos: Todo[] | undefined) => todos?.filter(t => t.id !== id), false);

      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      
      mutate('/api/todos');
    } catch (error) {
      console.error(error);
      mutate('/api/todos');
    }
  };

  const moveTodo = async (todoId: string, targetCategoryId: string, targetPhaseId?: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
        const oldContainerId = todo.phaseId || todo.categoryId;
        const newContainerId = targetPhaseId || targetCategoryId;
        
        if (oldContainerId !== newContainerId) {
             setTodoOrder(prev => {
                 const oldOrder = prev[oldContainerId] || [];
                 const newOrder = prev[newContainerId] || [];
                 
                 // Remove from old
                 const nextOldOrder = oldOrder.filter(id => id !== todoId);
                 
                 // Add to new ONLY IF NOT PRESENT
                 let nextNewOrder = newOrder;
                 if (!newOrder.includes(todoId)) {
                     nextNewOrder = [todoId, ...newOrder];
                 }
                 
                 const next = {
                     ...prev,
                     [oldContainerId]: nextOldOrder,
                     [newContainerId]: nextNewOrder 
                 };
                 localStorage.setItem('todoOrder', JSON.stringify(next));
                 return next;
             });
        }
    }
    await updateTodo(todoId, { categoryId: targetCategoryId, phaseId: targetPhaseId || null });
  };

  const toggleTimer = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    let updates: Partial<Todo> = {};
    
    if (todo.timerState === TimerState.IDLE || todo.timerState === TimerState.PAUSED || todo.timerState === TimerState.STOPPED) {
      updates = { timerState: TimerState.RUNNING, lastStartedAt: Date.now() };
    } else if (todo.timerState === TimerState.RUNNING) {
      updates = { timerState: TimerState.PAUSED };
    }
    
    await updateTodo(todoId, updates);
  };

  const stopTimer = async (todoId: string) => {
    await updateTodo(todoId, { timerState: TimerState.STOPPED, completed: true, completedAt: Date.now() });
  };

  const enrichTodoWithAI = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    const subtasks = await generateSubTodos(todo.title, todo.description);
    
    for (const st of subtasks) {
      try {
        await fetch(`/api/todos/${todoId}/subtodos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: st })
        });
      } catch (error) {
        console.error(error);
      }
    }
    mutate('/api/todos');
  };

  const addTeam = async (name: string) => {
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed to create team');
      const team = await res.json();
      mutate('/api/teams');
      return team;
    } catch (error) {
      console.error(error);
    }
  };

  const addTeamMember = async (teamId: string, name: string, role: string) => {
    // Normalize role to uppercase variant accepted by the API
    const roleParam = role ? role.toString().toUpperCase() : undefined;

    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: name, role: roleParam })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to add team member');
    }
    const member = await res.json();
    mutate('/api/teams');
    return member;
  };

  const respondToInvitation = async (invitationId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error('Failed to respond');
      mutate('/api/invitations');
      mutate('/api/todos');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TodoContext.Provider value={{
      todos, categories, teams, invitations, viewMode, setViewMode,
      isDarkMode, toggleDarkMode, isLoading,
      searchQuery, setSearchQuery, activeTeamId, setActiveTeamId,
      addCategory, deleteCategory, updateCategory, moveCategory, addPhase,
      addTodo, updateTodo, deleteTodo, moveTodo,
      toggleTimer, stopTimer, respondToInvitation, enrichTodoWithAI,
      addTeam, addTeamMember,
      geminiApiKey, setGeminiApiKey,
      todoOrder, reorderTodo
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