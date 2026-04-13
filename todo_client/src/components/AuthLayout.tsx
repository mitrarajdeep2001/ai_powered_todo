
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative overflow-hidden transition-colors">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-400/30 dark:bg-sky-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/30 dark:bg-violet-600/20 blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 justify-center items-center p-6 z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo / Header (optional, can be customized) */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Task<span className="gradient-text">Flow</span>
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
              Your AI-powered productivity hub
            </p>
          </div>

          {/* Form Container */}
          <div className="glass bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-3xl p-8 backdrop-blur-xl">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
