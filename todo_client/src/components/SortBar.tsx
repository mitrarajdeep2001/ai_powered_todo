import { motion } from 'framer-motion';
import { ArrowUpDown, Calendar, Clock, CaseLower, Type } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { CustomSelect, type SelectOption } from './CustomSelect';
import type { SortType } from '../types';

const sortOptions: SelectOption<SortType>[] = [
  { value: 'createdAt', label: 'Newest first', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'dueDate', label: 'Due date', icon: <Calendar className="w-3.5 h-3.5" /> },
  { value: 'priority', label: 'Priority', icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
  { value: 'title', label: 'Title A–Z', icon: <CaseLower className="w-3.5 h-3.5" /> },
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
        <CustomSelect
          options={sortOptions}
          value={sort}
          onChange={val => setSort(val as SortType)}
          className="min-w-[140px]"
        />
      </div>
    </div>
  );
};
