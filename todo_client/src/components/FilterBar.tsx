import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ListTodo, Layers } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import type { FilterType } from '../types';

const filters: { label: string; value: FilterType; icon: React.ReactNode; color: string }[] = [
  { label: 'All Tasks', value: 'all', icon: <Layers className="w-4 h-4" />, color: 'sky' },
  { label: 'To Do', value: 'todo', icon: <ListTodo className="w-4 h-4" />, color: 'slate' },
  { label: 'In Progress', value: 'in-progress', icon: <Clock className="w-4 h-4" />, color: 'blue' },
  { label: 'Done', value: 'done', icon: <CheckCircle2 className="w-4 h-4" />, color: 'green' },
];

const colorMap: Record<string, string> = {
  sky: 'bg-sky-500 text-white shadow-sky-500/30',
  slate: 'bg-slate-500 text-white shadow-slate-500/30',
  blue: 'bg-blue-500 text-white shadow-blue-500/30',
  green: 'bg-emerald-500 text-white shadow-emerald-500/30',
};

const activeCountMap: Record<string, string> = {
  sky: 'bg-white/30',
  slate: 'bg-white/30',
  blue: 'bg-white/30',
  green: 'bg-white/30',
};

export const FilterBar = () => {
  const { filter, setFilter, stats } = useTaskContext();

  const countMap: Record<FilterType, number> = {
    all: stats.total,
    todo: stats.todo,
    'in-progress': stats.inProgress,
    done: stats.done,
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filters.map(f => {
        const isActive = filter === f.value;
        return (
          <motion.button
            key={f.value}
            onClick={() => setFilter(f.value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? `${colorMap[f.color]} shadow-lg`
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              isActive ? activeCountMap[f.color] : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {countMap[f.value]}
            </span>
            {isActive && (
              <motion.div
                layoutId="filter-indicator"
                className="absolute inset-0 rounded-xl ring-2 ring-white/40 pointer-events-none"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
