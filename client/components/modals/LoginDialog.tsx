'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import useStore from '@/store/useStore';
import { useToast } from '@/lib/ToastContext';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginDialog({ open, onClose, onLoginSuccess }: LoginDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const setUser = useStore((s) => s.setUser);
  const setToken = useStore((s) => s.setToken);
  const syncWishlistFromServer = useStore((s) => s.syncWishlistFromServer);
  const syncCartFromServer = useStore((s) => s.syncCartFromServer);
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email: formData.email, password: formData.password });
      const userData = res.data?.user || res.data;
      const token = res.data?.token;

      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
      }

      if (userData) {
        setUser({
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      }

      // Sync wishlist and cart from server
      await syncWishlistFromServer();
      await syncCartFromServer();

      addToast('Login successful!', 'success');
      setFormData({ email: '', password: '', name: '', phone: '' });
      onClose();
      onLoginSuccess?.();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      addToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      const userData = res.data?.user || res.data;
      const token = res.data?.token;

      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
      }

      if (userData) {
        setUser({
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      }

      // Sync wishlist and cart from server
      await syncWishlistFromServer();
      await syncCartFromServer();

      addToast('Account created successfully!', 'success');
      setFormData({ email: '', password: '', name: '', phone: '' });
      onClose();
      onLoginSuccess?.();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-primary-gold/30 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="float-right text-gray-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 clear-right">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                isLogin
                  ? 'bg-primary-gold text-dark-bg'
                  : 'border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-primary-gold text-dark-bg'
                  : 'border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary mt-6 disabled:opacity-50"
            >
              {loading ? (isLogin ? 'Logging in...' : 'Creating account...') : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {isLogin && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="text-primary-gold hover:underline">
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
