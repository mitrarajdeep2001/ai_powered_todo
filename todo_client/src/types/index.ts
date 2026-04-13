export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;              // backend returns int
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;  // ISO datetime string (normalised from due_date)
  createdAt: string;       // ISO datetime string (normalised from created_at)
  updatedAt: string;       // ISO datetime string (normalised from updated_at)
  aiGenerated?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export type FilterType = 'all' | TaskStatus;
export type SortType = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark';
