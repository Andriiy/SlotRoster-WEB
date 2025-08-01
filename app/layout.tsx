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
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
