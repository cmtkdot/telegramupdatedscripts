import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import { cn } from '@/lib/utils';
import { initializeDatabase } from '@/lib/database';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

// Initialize database on app start
initializeDatabase().catch(console.error);

export const metadata: Metadata = {
  title: 'Media Hub',
  description: 'Your centralized media management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', spaceGrotesk.variable)}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
