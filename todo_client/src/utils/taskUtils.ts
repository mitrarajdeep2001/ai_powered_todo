import type { Task, TaskFormData, TaskStatus, TaskPriority } from '../types';

const STORAGE_KEY = 'ai-todo-tasks';

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultTasks();
    return JSON.parse(raw);
  } catch {
    return getDefaultTasks();
  }
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const getDefaultTasks = (): Task[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 1,
      title: 'Design new landing page',
      description: 'Create wireframes and mockups for the updated product landing page with improved conversion flow.',
      status: 'in-progress',
      priority: 'high',
      dueDate: tomorrow.toISOString(),
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: now.toISOString(),
      aiGenerated: false,
    },
    {
      id: 2,
      title: 'Write unit tests for auth module',
      description: 'Cover all edge cases in the authentication module including OAuth flows.',
      status: 'todo',
      priority: 'medium',
      dueDate: nextWeek.toISOString(),
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: now.toISOString(),
      aiGenerated: false,
    },
    {
      id: 3,
      title: 'Update project documentation',
      description: 'Refresh the API docs and README with the latest changes from v2.0 release.',
      status: 'done',
      priority: 'low',
      dueDate: null,
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
      updatedAt: now.toISOString(),
      aiGenerated: false,
    },
  ];
};

export const parseAITaskInput = (input: string): Partial<TaskFormData> => {
  const result: Partial<TaskFormData> = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  };

  // Detect priority
  if (/urgent|critical|asap|high priority|important/i.test(input)) {
    result.priority = 'high';
  } else if (/low priority|not urgent|whenever|someday/i.test(input)) {
    result.priority = 'low';
  } else {
    result.priority = 'medium';
  }

  // Detect status
  if (/in progress|working on|started|ongoing/i.test(input)) {
    result.status = 'in-progress';
  } else if (/done|completed|finished|already did/i.test(input)) {
    result.status = 'done';
  } else {
    result.status = 'todo';
  }

  // Detect due date
  const now = new Date();

  if (/\btoday\b/i.test(input)) {
    const d = new Date(now);
    d.setHours(23, 59, 0, 0);
    result.dueDate = d.toISOString().slice(0, 16);
  } else if (/\btomorrow\b/i.test(input)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    result.dueDate = d.toISOString().slice(0, 16);
  } else if (/\bnext week\b/i.test(input)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    result.dueDate = d.toISOString().slice(0, 16);
  } else if (/\bnext month\b/i.test(input)) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    d.setHours(23, 59, 0, 0);
    result.dueDate = d.toISOString().slice(0, 16);
  } else if (/\bin (\d+) days?\b/i.test(input)) {
    const match = input.match(/in (\d+) days?/i);
    if (match) {
      const d = new Date(now);
      d.setDate(d.getDate() + parseInt(match[1]));
      d.setHours(23, 59, 0, 0);
      result.dueDate = d.toISOString().slice(0, 16);
    }
  } else if (/\bthis (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(input)) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const match = input.match(/this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (match) {
      const targetDay = days.indexOf(match[1].toLowerCase());
      const d = new Date(now);
      const currentDay = d.getDay();
      const diff = (targetDay - currentDay + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(23, 59, 0, 0);
      result.dueDate = d.toISOString().slice(0, 16);
    }
  }

  // Clean the text to extract title and description
  let cleanText = input
    .replace(/urgent|critical|asap|high priority|important|low priority|not urgent|whenever|someday/gi, '')
    .replace(/in progress|working on|started|ongoing|done|completed|finished|already did/gi, '')
    .replace(/today|tomorrow|next week|next month|in \d+ days?|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If clean text is short, it's probably the whole title
  if (cleanText.length <= 80) {
    result.title = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    result.description = '';
  } else {
    // Try to split into title + description
    const sentences = cleanText.split(/[.!?]\s+/);
    result.title = sentences[0].charAt(0).toUpperCase() + sentences[0].slice(1);
    if (result.title.length > 80) {
      // Hard truncate at word boundary
      const words = result.title.split(' ');
      const titleWords: string[] = [];
      let len = 0;
      for (const w of words) {
        if (len + w.length > 70) break;
        titleWords.push(w);
        len += w.length + 1;
      }
      result.description = result.title.slice(titleWords.join(' ').length).trim();
      result.title = titleWords.join(' ');
    } else {
      result.description = sentences.slice(1).join('. ').trim();
    }
  }

  return result;
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-emerald-500';
  }
};

export const getPriorityBg = (priority: TaskPriority): string => {
  switch (priority) {
    case 'high': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/30';
    case 'medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border dark:border-amber-500/30';
    case 'low': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/30';
  }
};

export const getStatusBg = (status: TaskStatus): string => {
  switch (status) {
    case 'todo': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:border dark:border-slate-600';
    case 'in-progress': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border dark:border-blue-500/30';
    case 'done': return 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/30';
  }
};

export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case 'todo': return 'To Do';
    case 'in-progress': return 'In Progress';
    case 'done': return 'Done';
  }
};

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < -1) return `${Math.abs(days)}d overdue`;
  if (days < 7) return `In ${days}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const isOverdue = (dateStr: string | null, status: TaskStatus): boolean => {
  if (!dateStr || status === 'done') return false;
  return new Date(dateStr) < new Date();
};
