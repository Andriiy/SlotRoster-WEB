import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlotRoster - Aviation Club Management Platform',
  description: 'The complete aviation club management platform for fleet, members, and bookings. Built for pilots, by pilots.',
  keywords: 'aviation, air club, fleet management, pilot, aircraft, booking, scheduling',
  authors: [{ name: 'SlotRoster Team' }],
  openGraph: {
    title: 'SlotRoster - Aviation Club Management Platform',
    description: 'The complete aviation club management platform for fleet, members, and bookings.',
    type: 'website',
  },
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
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
