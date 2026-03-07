'use client';

import { useState, useEffect } from 'react';
import { adminAuthAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

export default function ProfilePage() {
  const { addToast } = useToast();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [nameForm, setNameForm] = useState({ name: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await adminAuthAPI.getProfile();
        const profile = res.data?.admin;
        setAdmin(profile);
        setNameForm({ name: profile?.name || '' });
      } catch (error: any) {
        addToast(error.response?.data?.message || 'Failed to load profile', 'error', 3000);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [addToast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameForm.name.trim()) {
      addToast('Name cannot be empty', 'warning', 3000);
      return;
    }
    setSavingProfile(true);
    try {
      const res = await adminAuthAPI.updateProfile({ name: nameForm.name });
      const updated = res.data?.admin;
      setAdmin(updated);
      // Sync to localStorage so sidebar also updates on next reload
      try {
        const stored = localStorage.getItem('adminUser');
        if (stored) {
          localStorage.setItem('adminUser', JSON.stringify({ ...JSON.parse(stored), name: nameForm.name }));
        }
      } catch {}
      addToast('Profile updated successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error', 3000);
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast('Please fill all password fields', 'warning', 3000);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New passwords do not match', 'warning', 3000);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'warning', 3000);
      return;
    }
    setSavingPassword(true);
    try {
      await adminAuthAPI.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Password changed successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to change password', 'error', 3000);
    }
    setSavingPassword(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading profile...</div>;
  }

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Admin <span className="text-primary-gold">Profile</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Manage your account details and security</p>
        </div>

        {/* Profile Card */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-gold to-accent-gold flex items-center justify-center text-dark-bg font-bold text-3xl shrink-0">
              {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white">{admin?.name}</h2>
              <p className="text-gray-400">{admin?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-gold/15 text-primary-gold capitalize">
                  {admin?.role || 'admin'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${admin?.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {admin?.isActive ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500 mb-1">Last Login</p>
              <p className="text-sm text-gray-300">
                {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-3 mb-1">Member Since</p>
              <p className="text-sm text-gray-300">
                {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">👤</div>
            <div className="stat-card-value text-primary-gold capitalize">{admin?.role || 'admin'}</div>
            <p className="stat-card-label">Role</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">🕒</div>
            <div className="stat-card-value text-base text-green-400 font-semibold">
              {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : '—'}
            </div>
            <p className="stat-card-label">Last Login</p>
          </div>
          <div className="stat-card col-span-2 sm:col-span-1">
            <div className="stat-card-icon bg-blue-500/10 text-blue-400">📅</div>
            <div className="stat-card-value text-base text-blue-400 font-semibold">
              {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
            </div>
            <p className="stat-card-label">Joined</p>
          </div>
        </div>

        {/* Update Name */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Update Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={admin?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-accent-gold text-dark-bg font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-gold/50 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 rounded-xl bg-red-600/80 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {savingPassword ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
