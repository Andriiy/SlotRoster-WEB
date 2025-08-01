import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Test Page',
  description: 'Test page'
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
      <body>
        {children}
      </body>
    </html>
  );
}
