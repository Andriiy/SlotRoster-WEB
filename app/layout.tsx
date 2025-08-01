import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'SlotRoster - Flight Club Management',
  description: 'Manage your flight club aircraft, bookings, and members.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="min-h-[100dvh] bg-background">
        {children}
      </body>
    </html>
  );
}
