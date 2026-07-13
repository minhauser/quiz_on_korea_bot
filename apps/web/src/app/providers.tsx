'use client';

import { ThemeProvider } from 'next-themes';

import { CommandPalette } from '@/components/command-palette';
import { HydrationGate } from '@/components/hydration-gate';
import { LocaleSync } from '@/components/locale-sync';
import { SimulationEngine } from '@/components/simulation-engine';
import { Toaster } from '@/components/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LocaleSync />
      <HydrationGate>{children}</HydrationGate>
      <CommandPalette />
      <Toaster />
      <SimulationEngine />
    </ThemeProvider>
  );
}
