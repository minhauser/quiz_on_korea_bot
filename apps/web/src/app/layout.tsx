import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { LOCALE_BOOTSTRAP_SCRIPT } from '@/i18n/locale-storage';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'pAIr - Korea Quest',
  description:
    'A gamified, AI-powered platform that helps international students learn Korean and thrive at university in South Korea.',
  openGraph: {
    title: 'pAIr - Korea Quest',
    description: 'A gamified, AI-powered platform that helps international students learn Korean and thrive at university in South Korea.',
    images: [{ url: '/penguin.png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh overflow-x-hidden antialiased">
        <Script id="locale-bootstrap" strategy="beforeInteractive">
          {LOCALE_BOOTSTRAP_SCRIPT}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
