'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';

import { CommandPalette } from '@/components/command-palette';
import { HydrationGate } from '@/components/hydration-gate';
import { LocaleSync } from '@/components/locale-sync';
import { Toaster } from '@/components/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 10_000 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <LocaleSync />
        <HydrationGate>{children}</HydrationGate>
        <CommandPalette />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
