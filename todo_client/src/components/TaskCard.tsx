import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Tag, MoreVertical, Edit2, Trash2,
  CheckCircle2, Circle, Clock, Zap, ChevronRight
} from 'lucide-react';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import {
  getPriorityBg, getStatusBg, getStatusLabel,
  formatDate, isOverdue
} from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  index: number;
  isListView?: boolean;
}

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
  if (priority === 'high') return <Zap className="w-3 h-3 fill-current" />;
  if (priority === 'medium') return <ChevronRight className="w-3 h-3" />;
  return <span className="w-3 h-3 flex items-center justify-center text-[10px] font-bold">—</span>;
};

export const TaskCard = ({ task, onEdit, index, isListView = false }: TaskCardProps) => {
  const { deleteTask, toggleTaskStatus } = useTaskContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const overdue = isOverdue(task.dueDate, task.status);

  const handleDelete = async () => {
    setMenuOpen(false);
    setIsDeleting(true);
    setTimeout(() => deleteTask(task.id), 300);
  };

  const statusIcon = {
    'todo': <Circle className="w-4 h-4 text-slate-400" />,
    'in-progress': <Clock className="w-4 h-4 text-blue-500" />,
    'done': <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500" />,
  };

  if (isListView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isDeleting ? 0 : 1, x: isDeleting ? 20 : 0, scale: isDeleting ? 0.95 : 1 }}
        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`group relative flex items-center gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-2xl border transition-all cursor-default
          ${task.status === 'done' ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-slate-200/80 dark:border-slate-700/50'}
          hover:border-sky-300 dark:hover:border-sky-700/50 hover:shadow-md dark:hover:shadow-sky-900/10`}
      >
        {/* Status toggle */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleTaskStatus(task.id)}
          className="shrink-0 hover:scale-110 transition-transform"
        >
          {statusIcon[task.status]}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold text-slate-800 dark:text-slate-100 truncate ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
              {task.title}
            </h3>
            {task.aiGenerated && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{task.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${getPriorityBg(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${getStatusBg(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -10 : 0, scale: isDeleting ? 0.9 : 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`group relative bg-white dark:bg-slate-800/60 rounded-2xl border transition-all
        ${task.status === 'done' ? 'border-slate-100 dark:border-slate-800 opacity-75' : 'border-slate-200/80 dark:border-slate-700/50'}
        hover:border-sky-300 dark:hover:border-sky-700/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-sky-900/10`}
    >
      {/* Priority indicator strip */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-opacity ${
        task.priority === 'high' ? 'bg-gradient-to-r from-red-400 to-orange-400' :
        task.priority === 'medium' ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
        'bg-gradient-to-r from-emerald-400 to-teal-400'
      } ${task.status === 'done' ? 'opacity-30' : 'opacity-100'}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <motion.button
              whileTap={{ scale: 0.75 }}
              onClick={() => toggleTaskStatus(task.id)}
              className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
            >
              {statusIcon[task.status]}
            </motion.button>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm font-semibold leading-snug ${
                task.status === 'done'
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}>
                {task.title}
              </h3>
            </div>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(m => !m)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-7 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[140px]"
                  >
                    <button
                      onClick={() => { onEdit(task); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-500" />
                      Edit task
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed pl-6">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 pl-6">
            {task.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 pl-6">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityBg(task.priority)}`}>
              <PriorityIcon priority={task.priority} />
              {task.priority}
            </span>
            {task.aiGenerated && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>

          {task.dueDate ? (
            <span className={`flex items-center gap-1 text-xs font-medium ${
              overdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
            }`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBg(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
