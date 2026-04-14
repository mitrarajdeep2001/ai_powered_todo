import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        )}
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
          </label>
          <a href="#" className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white rounded-xl font-medium shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-sky-500 hover:text-sky-600 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
};
