import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const StatsBar = () => {
  const { stats } = useTaskContext();
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 flex items-center gap-6"
    >
      {/* Progress */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Completion rate</span>
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{completionRate}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-5 shrink-0">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700 dark:text-slate-200' },
          { label: 'Active', value: stats.todo + stats.inProgress, color: 'text-blue-500' },
          { label: 'Done', value: stats.done, color: 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
