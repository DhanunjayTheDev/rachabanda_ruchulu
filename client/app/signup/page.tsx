'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import useStore from '@/store/useStore';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);
  const setToken = useStore((s) => s.setToken);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                Join <span className="text-primary-gold">Rachabanda Ruchulu</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Create an account and explore the best authentic Hyderabadi
                cuisine with exclusive offers and rewards.
              </p>
              <div className="space-y-6">
                {[
                  { icon: '🎁', title: 'Welcome Bonus', desc: '₹100 discount on your first order' },
                  { icon: '⭐', title: 'Loyalty Points', desc: 'Earn points on every order' },
                  { icon: '🔐', title: 'Secure Payment', desc: 'Safe and secure transactions' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div><h3 className="font-bold">{item.title}</h3><p className="text-gray-400 text-sm">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Signup Form */}
            <div className="card">
              <h2 className="text-3xl font-bold mb-8">Create Account</h2>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">{error}</div>}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" required className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 accent-primary-gold" />
                  <span className="text-sm text-gray-400">I agree to the <span className="text-primary-gold hover:text-primary-accent-gold cursor-pointer">Terms &amp; Conditions</span></span>
                </label>
                <button type="submit" disabled={!agreeTerms || loading} className="w-full btn btn-primary mt-4 disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-dark-card text-gray-400">Or sign up with</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="px-4 py-2 rounded-lg border border-gray-600 hover:border-primary-gold text-gray-300 hover:text-primary-gold font-semibold transition-all flex items-center justify-center gap-2 text-sm">🔵 Google</button>
                <button className="px-4 py-2 rounded-lg border border-gray-600 hover:border-primary-gold text-gray-300 hover:text-primary-gold font-semibold transition-all flex items-center justify-center gap-2 text-sm">👤 Phone</button>
              </div>
              <p className="text-center mt-6 text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-gold hover:text-primary-accent-gold font-semibold">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
  );
}
