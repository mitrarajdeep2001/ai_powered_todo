import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Mic, MicOff, Send, X, Wand2,
  CheckCircle2, AlertCircle, Loader2, Volume2
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { parseAITaskInput } from '../utils/taskUtils';
import type { TaskFormData } from '../types';

interface AIInputPanelProps {
  onOpenModal: (prefill?: Partial<TaskFormData>) => void;
}

type ProcessState = 'idle' | 'processing' | 'success' | 'error';

const suggestions = [
  "Design homepage mockup with high priority due tomorrow",
  "Write unit tests for auth module next week",
  "Research competitor pricing, low priority",
  "Fix critical login bug ASAP today",
  "Update documentation this Friday",
];

export const AIInputPanel = ({ onOpenModal }: AIInputPanelProps) => {
  const { addTask } = useTaskContext();
  const [inputText, setInputText] = useState('');
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, interimTranscript, isSupported, toggleListening } = useVoiceInput({
    onTranscript: (text) => {
      setInputText(prev => (prev ? prev + ' ' + text : text).trim());
      setIsExpanded(true);
      inputRef.current?.focus();
    },
    onError: (err) => {
      setStatusMessage(err);
      setProcessState('error');
      setTimeout(() => setProcessState('idle'), 3000);
    },
  });

  const displayText = inputText + (interimTranscript ? (inputText ? ' ' : '') + interimTranscript : '');

  const processInput = async (text: string, directAdd = false) => {
    if (!text.trim()) return;

    setProcessState('processing');
    setStatusMessage('Analyzing your input...');

    // Simulate AI processing delay for UX
    await new Promise(r => setTimeout(r, 600));

    const parsed = parseAITaskInput(text);

    if (!parsed.title) {
      setProcessState('error');
      setStatusMessage('Could not extract task title. Try being more specific.');
      setTimeout(() => setProcessState('idle'), 3000);
      return;
    }

    if (directAdd) {
      const formData: TaskFormData = {
        title: parsed.title || text.trim(),
        description: parsed.description || '',
        status: parsed.status || 'todo',
        priority: parsed.priority || 'medium',
        dueDate: parsed.dueDate || '',
        tags: parsed.tags || [],
      };
      addTask({ ...formData }, true);
      setProcessState('success');
      setStatusMessage(`Task "${parsed.title}" created!`);
      setInputText('');
      setTimeout(() => {
        setProcessState('idle');
        setStatusMessage('');
      }, 2500);
    } else {
      // Open modal with prefilled data
      onOpenModal(parsed);
      setInputText('');
      setProcessState('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processInput(inputText, true);
    }
    if (e.key === 'Escape') {
      setInputText('');
      setIsExpanded(false);
    }
  };

  const handleSuggestion = (s: string) => {
    setInputText(s);
    setShowSuggestions(false);
    setIsExpanded(true);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (isListening) setIsExpanded(true);
  }, [isListening]);

  return (
    <div className="relative">
      <motion.div
        layout
        className={`relative bg-gradient-to-br from-sky-50 via-white to-violet-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 rounded-2xl border transition-all ${
          isExpanded
            ? 'border-sky-300 dark:border-sky-700/60 shadow-lg shadow-sky-100/50 dark:shadow-sky-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-800'
        }`}
      >
        {/* AI Badge */}
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md shadow-sky-500/30">
          <Sparkles className="w-3 h-3" />
          AI Assistant
        </div>

        <div className="pt-4 pb-3 px-4">
          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="relative flex items-center justify-center w-7 h-7">
                  <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Listening... {interimTranscript && <span className="text-slate-400 italic">"{interimTranscript}"</span>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="flex items-start gap-3">
            <div className="mt-1 w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center shadow">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <textarea
              ref={inputRef}
              value={displayText}
              onChange={e => {
                setInputText(e.target.value);
                if (!isExpanded && e.target.value) setIsExpanded(true);
              }}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your task in natural language... e.g., 'Fix critical login bug with high priority due tomorrow'"
              rows={isExpanded ? 3 : 1}
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
            />

            {/* Clear button */}
            <AnimatePresence>
              {inputText && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => { setInputText(''); setIsExpanded(false); }}
                  className="mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              {/* Voice button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={toggleListening}
                disabled={!isSupported}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : isSupported
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
                title={!isSupported ? 'Speech recognition not supported in this browser' : ''}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    {isSupported ? 'Voice' : 'No mic'}
                  </>
                )}
              </motion.button>

              {/* Suggestions button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSuggestions(s => !s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Examples
              </motion.button>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {inputText.trim() && processState === 'idle' && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => processInput(inputText, false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Preview & Edit
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => processInput(inputText, true)}
                disabled={!inputText.trim() || processState === 'processing'}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  inputText.trim() && processState === 'idle'
                    ? 'bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-md shadow-sky-500/25 hover:shadow-sky-500/40'
                    : processState === 'processing'
                    ? 'bg-sky-400 text-white cursor-wait'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {processState === 'processing' ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Create Task</>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Status message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-t ${
                processState === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
              }`}
            >
              {processState === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-30 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Example prompts — click to use</p>
            </div>
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSuggestion(s)}
                className="flex items-start gap-2 w-full px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-sky-500" />
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
