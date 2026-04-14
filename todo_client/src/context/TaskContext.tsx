import React, {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';
import type { Task, TaskFormData, FilterType, SortType, ViewMode, Theme } from '../types';
import type { TaskStatus, TaskPriority } from '../types';
import { api } from '../utils/api';

// ─── Backend ↔ Frontend normalisers ────────────────────────────────────────

/** Convert backend uppercase status to frontend lowercase */
function normaliseStatus(s: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done',
  };
  return map[s] ?? 'todo';
}

/** Convert frontend lowercase status to backend uppercase */
function toApiStatus(s: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    'todo': 'TODO',
    'in-progress': 'IN_PROGRESS',
    'done': 'DONE',
  };
  return map[s];
}

/** Convert backend uppercase priority to frontend lowercase */
function normalisePriority(p: string): TaskPriority {
  const map: Record<string, TaskPriority> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };
  return map[p] ?? 'medium';
}

/** Convert frontend lowercase priority to backend uppercase */
function toApiPriority(p: TaskPriority): string {
  return p.toUpperCase();
}

/** Map a raw backend JSON response to the frontend Task shape */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiTask(raw: any): Task {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    status: normaliseStatus(raw.status),
    priority: normalisePriority(raw.priority),
    dueDate: raw.due_date ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Context types ──────────────────────────────────────────────────────────

export interface AIResponse {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'GET';
  success: boolean;
  data: any;
  error?: string;
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: FilterType;
  sort: SortType;
  viewMode: ViewMode;
  theme: Theme;
  searchQuery: string;
  setFilter: (f: FilterType) => void;
  setSort: (s: SortType) => void;
  setViewMode: (v: ViewMode) => void;
  toggleTheme: () => void;
  setSearchQuery: (q: string) => void;
  addTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: number, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskStatus: (id: number) => Promise<void>;
  executeAICommand: (prompt: string) => Promise<AIResponse>;
  stats: { total: number; todo: number; inProgress: number; done: number };
}

const TaskContext = createContext<TaskContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('createdAt');
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem('viewMode') as ViewMode) || 'grid',
  );
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Theme side-effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── Fetch all todos on mount ──────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/todos/');
      if (!res.ok) throw new Error(`Failed to fetch todos (${res.status})`);
      const raw = await res.json();
      setTasks(raw.map(mapApiTask));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── CRUD operations ───────────────────────────────────────────────────────

  const addTask = useCallback(async (data: TaskFormData): Promise<Task> => {
    const payload = {
      title: data.title,
      description: data.description || null,
      status: toApiStatus(data.status),
      priority: toApiPriority(data.priority),
      due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };
    const res = await api.post('/todos/', payload);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create todo');
    }
    const raw = await res.json();
    const task = mapApiTask(raw);
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback(async (id: number, data: Partial<TaskFormData>): Promise<void> => {
    const payload: Record<string, unknown> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description || null;
    if (data.status !== undefined) payload.status = toApiStatus(data.status);
    if (data.priority !== undefined) payload.priority = toApiPriority(data.priority);
    if (data.dueDate !== undefined)
      payload.due_date = data.dueDate ? new Date(data.dueDate).toISOString() : null;

    const res = await api.put(`/todos/${id}`, payload);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update todo');
    }
    const raw = await res.json();
    const updated = mapApiTask(raw);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    const res = await api.delete(`/todos/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete todo');
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback(async (id: number): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const cycle: Record<TaskStatus, TaskStatus> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo',
    };
    await updateTask(id, { status: cycle[task.status] });
  }, [tasks, updateTask]);

  const executeAICommand = useCallback(async (prompt: string): Promise<AIResponse> => {
    const res = await api.post(`/ai/chat?prompt=${encodeURIComponent(prompt)}`, {});
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'AI processing failed');
    }
    const raw = await res.json();
    
    // The backend executes immediately, so our local tasks might be stale.
    // If it's a modifying action, re-fetch.
    if (raw && raw.action !== 'GET') {
      await fetchTasks();
    } else if (raw && raw.action === 'GET') {
      // For get actions, we could theoretically update local tasks but our system
      // uses filters instead. For now, since GET is fully resolved on backend,
      // you could optionally set local tasks if you want exactly that filter view.
      // Easiest is just replacing filteredTasks list, but we'll stick to a full sync.
      if (raw.data && Array.isArray(raw.data)) {
         setTasks(raw.data.map(mapApiTask));
      }
    }
    
    return raw as AIResponse;
  }, [fetchTasks]);

  // ── Derived state (filtering / sorting) ──────────────────────────────────

  const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    if (filter !== 'all') {
      result = result.filter(t => t.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [tasks, filter, searchQuery, sort]);

  const stats = React.useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    }),
    [tasks],
  );

  return (
    <TaskContext.Provider
      value={{
        tasks, filteredTasks, isLoading, error,
        filter, sort, viewMode, theme, searchQuery,
        setFilter, setSort, setViewMode, toggleTheme, setSearchQuery,
        addTask, updateTask, deleteTask, toggleTaskStatus, executeAICommand, stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
