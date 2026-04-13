import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import type { SortType } from '../types';

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'createdAt', label: 'Newest first' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title A–Z' },
];

export const SortBar = () => {
  const { sort, setSort, filteredTasks, searchQuery } = useTaskContext();

  return (
    <div className="flex items-center justify-between gap-4">
      <motion.p
        key={filteredTasks.length}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-slate-500 dark:text-slate-400"
      >
        {searchQuery ? (
          <><span className="font-semibold text-slate-700 dark:text-slate-200">{filteredTasks.length}</span> result{filteredTasks.length !== 1 ? 's' : ''} for "<span className="text-sky-500">{searchQuery}</span>"</>
        ) : (
          <><span className="font-semibold text-slate-700 dark:text-slate-200">{filteredTasks.length}</span> task{filteredTasks.length !== 1 ? 's' : ''}</>
        )}
      </motion.p>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortType)}
          className="text-xs text-slate-600 dark:text-slate-300 bg-transparent border-none focus:outline-none cursor-pointer font-medium"
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
