import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, AlertCircle } from 'lucide-react';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export const TaskList = ({ onEdit, onAdd }: TaskListProps) => {
  const { filteredTasks, viewMode, isLoading, error } = useTaskContext();

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-500"
        />
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading your tasks…</p>
      </motion.div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            Failed to load tasks
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{error}</p>
        </div>
      </motion.div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (filteredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100 dark:from-sky-900/30 dark:to-violet-900/30 flex items-center justify-center"
        >
          <ClipboardList className="w-10 h-10 text-sky-400" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No tasks found</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Try adjusting your filters or create a new task
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/25"
        >
          <Plus className="w-4 h-4" />
          Add your first task
        </motion.button>
      </motion.div>
    );
  }

  // ── Task grid / list ───────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
      }
    >
      <AnimatePresence mode="popLayout">
        {filteredTasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            index={i}
            isListView={viewMode === 'list'}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
