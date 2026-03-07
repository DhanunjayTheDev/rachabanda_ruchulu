import './globals.css';
import type { Metadata } from 'next';
import AdminRootLayoutClient from './AdminRootLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Rachabanda Ruchulu',
  description: 'Admin panel for managing restaurant operations',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminRootLayoutClient>{children}</AdminRootLayoutClient>
      </body>
    </html>
  );
}
