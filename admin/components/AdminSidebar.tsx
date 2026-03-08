'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/lib/ToastContext';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/orders', label: 'Orders', icon: '📦' },
  { href: '/foods', label: 'Foods', icon: '🍽️' },
  { href: '/categories', label: 'Categories', icon: '📂' },
  { href: '/restaurants', label: 'Restaurants', icon: '🏪' },
  { href: '/customers', label: 'Customers', icon: '👥' },
  { href: '/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/announcements', label: 'Announcements', icon: '📢' },
  { href: '/payments', label: 'Payments', icon: '💳' },
  { href: '/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/qrcodes', label: 'QR Codes', icon: '📱' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('admin@rachabanda.com');

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const admin = JSON.parse(adminUser);
        setAdminName(admin.name || admin.firstName || 'Admin');
        setAdminEmail(admin.email || 'admin@rachabanda.com');
      } catch (error) {
        console.error('Failed to parse admin user:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    addToast('Logged out successfully', 'success', 2000);
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass text-primary-gold"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-white/10 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #1A1410 0%, #0F0B08 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-gold to-accent-gold flex items-center justify-center text-dark-bg font-bold text-lg shrink-0">
            R
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-sm font-bold text-white leading-tight">Rachabanda</h1>
              <p className="text-xs text-primary-gold">Admin Panel</p>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-gold/15 text-primary-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-gold"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle (desktop) */}
        <div className="hidden lg:block border-t border-white/10 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>

        {/* User */}
        <div className="border-t border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-gold to-accent-gold flex items-center justify-center text-dark-bg font-bold text-sm shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white line-clamp-2">{adminName}</p>
                <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
