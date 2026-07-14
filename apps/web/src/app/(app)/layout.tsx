import { AppSidebar } from '@/components/app-sidebar';
import { AuthGate } from '@/components/auth-gate';
import { BottomNav } from '@/components/bottom-nav';
import { LessonPlayer } from '@/components/lesson-player';
import { NetworkStatusBanner } from '@/components/network-status-banner';
import { PageTransition } from '@/components/page-transition';
import { TopBar } from '@/components/top-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-dvh bg-background">
        <NetworkStatusBanner />
        <AppSidebar />
        <div className="lg:pl-64">
          <TopBar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12 2xl:max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <BottomNav />
        <LessonPlayer />
      </div>
    </AuthGate>
  );
}
