'use client';

import { ToastProvider } from '@/lib/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import AdminShell from '@/components/AdminShell';
import AdminNotificationPanel from '@/components/AdminNotificationPanel';

export default function AdminRootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
      <ToastContainer />
      <AdminNotificationPanel />
    </ToastProvider>
  );
}
