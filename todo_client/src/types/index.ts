export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // ISO datetime string
  createdAt: string;
  updatedAt: string;
  tags: string[];
  aiGenerated?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
}

export type FilterType = 'all' | TaskStatus;
export type SortType = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark';
