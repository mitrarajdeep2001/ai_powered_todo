import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MoreVertical, Edit2, Trash2,
  CheckCircle2, Circle, Clock, Zap, ChevronRight,
  RefreshCw, Loader2,
} from 'lucide-react';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import {
  getPriorityBg, getStatusBg, getStatusLabel,
  formatDate, isOverdue,
} from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  index: number;
  isListView?: boolean;
}

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
  if (priority === 'high') return <Zap className="w-3.5 h-3.5 fill-current" />;
  if (priority === 'medium') return <ChevronRight className="w-3.5 h-3.5" />;
  return <span className="w-3.5 h-3.5 flex items-center justify-center text-xs font-black">—</span>;
};

const formatTimestamp = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const TaskCard = ({ task, onEdit, index, isListView = false }: TaskCardProps) => {
  const { deleteTask, toggleTaskStatus } = useTaskContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const overdue = isOverdue(task.dueDate, task.status);

  const handleDelete = async () => {
    setMenuOpen(false);
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
    } catch {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleTaskStatus(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  const statusIcon = {
    'todo': isToggling
      ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      : <Circle className="w-5 h-5 text-slate-400" />,
    'in-progress': isToggling
      ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
      : <Clock className="w-5 h-5 text-sky-400" />,
    'done': isToggling
      ? <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
      : <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400" />,
  };

  const priorityColors = {
    high: 'from-rose-500 to-red-600 shadow-rose-500/20',
    medium: 'from-amber-400 to-orange-500 shadow-amber-500/20',
    low: 'from-emerald-400 to-teal-500 shadow-emerald-500/20',
  };

  const cardBaseClasses = `group relative overflow-hidden transition-all duration-500
    bg-white dark:bg-[#1a1f2e]
    rounded-3xl border-2
    ${task.status === 'done'
      ? 'border-slate-100 dark:border-slate-800 opacity-80'
      : 'border-slate-200/60 dark:border-slate-700/80 shadow-2xl dark:shadow-black'
    }
    hover:border-sky-500/50 dark:hover:border-sky-400/50
    hover:shadow-sky-500/10 dark:hover:shadow-sky-400/10
    hover:-translate-y-2 active:scale-[0.98]`;

  // ── List view ─────────────────────────────────────────────────────────────
  if (isListView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: isDeleting ? 0 : 1, x: isDeleting ? 30 : 0, scale: isDeleting ? 0.9 : 1 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.04 }}
        className={`${cardBaseClasses} flex items-center gap-5 p-5 cursor-default`}
      >
        <motion.button
          whileTap={{ scale: 0.7 }}
          onClick={handleToggle}
          disabled={isToggling}
          className="shrink-0 transition-all active:brightness-125 disabled:cursor-wait"
        >
          {statusIcon[task.status]}
        </motion.button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-black tracking-tight leading-tight truncate ${
            task.status === 'done'
              ? 'line-through text-slate-400 dark:text-slate-600'
              : 'text-slate-800 dark:text-white'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1.5 truncate font-semibold">
              {task.description}
            </p>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border-2 ${getPriorityBg(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border-2 ${getStatusBg(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-2 text-xs font-black ${overdue ? 'text-rose-500' : 'text-slate-600 dark:text-slate-200'}`}>
              <Calendar className="w-4 h-4" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-sky-500 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 disabled:cursor-wait"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Grid / card view ──────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -20 : 0, scale: isDeleting ? 0.8 : 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.06 }}
      className={cardBaseClasses}
    >
      {/* Visual background glow flare */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 dark:opacity-30 bg-gradient-to-br ${priorityColors[task.priority]}`} />

      {/* Priority accent top border */}
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${priorityColors[task.priority]}`} />

      <div className="p-6 pt-9 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <motion.button
                whileTap={{ scale: 0.6 }}
                onClick={handleToggle}
                disabled={isToggling}
                className="shrink-0 transition-all active:brightness-150 disabled:cursor-wait"
              >
                {statusIcon[task.status]}
              </motion.button>
              <h3 className={`text-lg font-black tracking-tight leading-tight ${
                task.status === 'done'
                  ? 'line-through text-slate-400 dark:text-slate-600'
                  : 'text-slate-800 dark:text-white'
              }`}>
                {task.title}
              </h3>
            </div>
          </div>

          <div className="relative shrink-0">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.05)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(m => !m)}
              className="p-2 rounded-xl text-slate-400 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    className="absolute right-0 top-11 z-20 bg-white dark:bg-[#242b3d] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700 py-2.5 min-w-[180px]"
                  >
                    <button
                      onClick={() => { onEdit(task); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-sky-500" />
                      Edit Details
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Delete Task
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {task.description && (
          <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed font-bold">
            {task.description}
          </p>
        )}

        <div className="flex flex-col gap-5 pt-5 border-t-2 border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
              <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border-2 shadow-lg ${getPriorityBg(task.priority)}`}>
                <PriorityIcon priority={task.priority} />
                {task.priority}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {task.dueDate ? (
                <span className={`flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${
                  overdue ? 'text-rose-500' : 'text-slate-600 dark:text-slate-200'
                }`}>
                  <Calendar className="w-4 h-4" />
                  {formatDate(task.dueDate)}
                </span>
              ) : (
                <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border-2 ${getStatusBg(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tight">
                 Updated {formatTimestamp(task.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
