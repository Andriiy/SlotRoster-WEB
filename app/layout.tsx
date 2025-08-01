import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Flight Club Management',
  description: 'Manage your flight club aircraft, bookings, and members.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-background text-foreground ${manrope.className}`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-[100dvh] bg-background">
        {children}
      </body>
    </html>
  );
}
