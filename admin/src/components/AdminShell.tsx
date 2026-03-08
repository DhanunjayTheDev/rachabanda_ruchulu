import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      if (!isLoginPage) {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, isLoginPage, navigate]);

  // Login page — no sidebar
  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Loading state
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirecting
  if (!authenticated) {
    return null;
  }

  // Authenticated — show sidebar layout
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen p-6 lg:p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
