'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useAuthStore } from '@/store/use-auth-store';

/** Redirects to /login when the (app) route group is visited without a session. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  React.useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace('/login');
    }
  }, [hasHydrated, accessToken, router]);

  if (!hasHydrated || !accessToken) return null;
  return <>{children}</>;
}
