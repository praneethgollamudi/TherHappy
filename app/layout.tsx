import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'TherHappy — Your Mental Wellness Companion',
  description: 'A safe space to track your mood, journal your thoughts, and find support.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <Navigation />
          <main className="pb-24 md:pb-8 md:pl-64 pt-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
