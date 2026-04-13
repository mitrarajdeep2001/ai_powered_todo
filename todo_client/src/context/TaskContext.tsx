import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskFormData, FilterType, SortType, ViewMode, Theme } from '../types';
import { loadTasks, saveTasks } from '../utils/taskUtils';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
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
  addTask: (data: TaskFormData, aiGenerated?: boolean) => Task;
  updateTask: (id: string, data: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  stats: { total: number; todo: number; inProgress: number; done: number };
}

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('createdAt');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('viewMode') as ViewMode) || 'grid';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const addTask = useCallback((data: TaskFormData, aiGenerated = false): Task => {
    const newTask: Task = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags,
      aiGenerated,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, data: Partial<TaskFormData>) => {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate).toISOString() : null) : t.dueDate,
      updatedAt: new Date().toISOString(),
    } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const statusCycle = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' } as const;
      return { ...t, status: statusCycle[t.status], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    if (filter !== 'all') {
      result = result.filter(t => t.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
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

  const stats = React.useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks]);

  return (
    <TaskContext.Provider value={{
      tasks, filteredTasks, filter, sort, viewMode, theme, searchQuery,
      setFilter, setSort, setViewMode, toggleTheme, setSearchQuery,
      addTask, updateTask, deleteTask, toggleTaskStatus, stats,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
