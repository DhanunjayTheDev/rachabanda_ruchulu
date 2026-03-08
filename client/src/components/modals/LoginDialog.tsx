import { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '@/store/useStore';
import { authAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const LoginDialog = ({ open, onClose, onLoginSuccess }: LoginDialogProps) => {
  const setToken = useStore((s) => s.setToken);
  const setUser = useStore((s) => s.setUser);
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data;
      setToken(data.token);
      setUser(data.user || data);
      addToast('Login successful!', 'success');
      onClose();
      onLoginSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      addToast(msg, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl max-w-sm w-full p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-white">Login</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        <p className="text-gray-400 text-sm">Please login to continue</p>

        {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" onClick={onClose} className="text-primary-gold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginDialog;
