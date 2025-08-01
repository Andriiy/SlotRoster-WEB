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
  console.log('RootLayout rendering');
  
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
            background-color: #ffffff;
            color: #000000;
          }
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .content {
            text-align: center;
          }
          .title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .subtitle {
            margin-bottom: 2rem;
            color: #666666;
          }
          .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
          }
          .primary {
            background-color: #000000;
            color: #ffffff;
          }
          .secondary {
            background-color: #f3f4f6;
            color: #000000;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
