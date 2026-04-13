import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { AIInputPanel } from './AIInputPanel';
import { SortBar } from './SortBar';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import type { Task, TaskFormData } from '../types';
import { Plus } from 'lucide-react';
import { TaskProvider } from '../context/TaskContext';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardInner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalPrefill, setModalPrefill] = useState<Partial<TaskFormData> | undefined>();

  const openAdd = (prefill?: Partial<TaskFormData>) => {
    setEditingTask(null);
    setModalPrefill(prefill);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalPrefill(undefined);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setModalPrefill(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-24">
        {/* Stats */}
        <StatsBar />

        {/* AI Input Panel */}
        <div className="relative z-20">
          <AIInputPanel onOpenModal={openAdd} />
        </div>

        {/* Filters & Sort */}
        <div className="space-y-3">
          <FilterBar />
          <SortBar />
        </div>

        {/* Task List */}
        <TaskList onEdit={openEdit} onAdd={() => openAdd()} />
      </main>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => openAdd()}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-xl shadow-sky-500/30 flex items-center justify-center hover:shadow-sky-500/50 transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal
            task={editingTask}
            prefill={modalPrefill}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  
  // Protect route
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TaskProvider>
      <DashboardInner />
    </TaskProvider>
  );
};
