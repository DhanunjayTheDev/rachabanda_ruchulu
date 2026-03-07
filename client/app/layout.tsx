import './globals.css';
import { Metadata } from 'next';
import RootLayoutClient from './RootLayoutClient';

export const metadata: Metadata = {
  title: 'Rachabanda Ruchulu - Premium Food Delivery',
  description: 'Authentic Hyderabadi cuisine delivered fresh to your doorstep',
  keywords: 'food delivery, Hyderabad, biryani, Indian cuisine',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Rachabanda Ruchulu',
    description: 'Premium food delivery in Hyderabad',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
