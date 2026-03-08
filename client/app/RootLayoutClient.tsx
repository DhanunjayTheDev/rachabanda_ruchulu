'use client';

import { ToastProvider } from '@/lib/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import NotificationPanel from '@/components/shared/NotificationPanel';
import GlobalRealtimeProvider from '@/components/shared/GlobalRealtimeProvider';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <GlobalRealtimeProvider />
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
      <ToastContainer />
      <NotificationPanel />
    </ToastProvider>
  );
}
