'use client';

import { ToastProvider } from '@/lib/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import AdminShell from '@/components/AdminShell';

export default function AdminRootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
      <ToastContainer />
    </ToastProvider>
  );
}
