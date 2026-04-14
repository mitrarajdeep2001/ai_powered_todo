import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  dropdownClassName?: string;
}

export const CustomSelect = <T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  dropdownClassName = '',
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium transition-all focus:outline-none"
      >
        {selectedOption.icon}
        <span className="text-slate-800 dark:text-slate-200">{selectedOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 min-w-[160px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden ${dropdownClassName}`}
            style={{ top: '100%', right: 0 }}
          >
            <div className="py-1">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    opt.value === value
                      ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {opt.icon}
                  <span className="flex-1">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
