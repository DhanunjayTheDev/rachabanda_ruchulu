'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import useStore from '@/store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);
  const setToken = useStore((s) => s.setToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data;
      const token = data.token || data.accessToken;
      const user = data.user || data;
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
      }
      if (user) setUser(user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Left - Branding */}
            <div className="hidden lg:block">
              <h1 className="text-6xl font-bold mb-6">
                <span className="text-primary-gold">Welcome Back</span> to
                Rachabanda Ruchulu
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Sign in to your account and enjoy authentic Hyderabadi cuisine
                delivered to your doorstep.
              </p>
              <div className="space-y-6">
                {[
                  { icon: '🍚', title: 'Premium Quality', desc: 'Authentic dishes with best ingredients' },
                  { icon: '⚡', title: 'Fast Delivery', desc: 'Hot food delivered within 30-45 minutes' },
                  { icon: '💰', title: 'Best Prices', desc: 'Affordable rates with regular discounts' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div><h3 className="font-bold">{item.title}</h3><p className="text-gray-400 text-sm">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Login Form */}
            <div className="card">
              <h2 className="text-3xl font-bold mb-8">Sign In</h2>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-primary-gold" />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary-gold hover:text-primary-accent-gold">Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading} className="w-full btn btn-primary disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-dark-card text-gray-400">Or continue with</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="px-4 py-3 rounded-lg border border-gray-600 hover:border-primary-gold text-gray-300 hover:text-primary-gold font-semibold transition-all flex items-center justify-center gap-2">🔵 Google</button>
                <button className="px-4 py-3 rounded-lg border border-gray-600 hover:border-primary-gold text-gray-300 hover:text-primary-gold font-semibold transition-all flex items-center justify-center gap-2">👤 Phone</button>
              </div>
              <p className="text-center mt-8 text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary-gold hover:text-primary-accent-gold font-semibold">Sign up here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
  );
}
