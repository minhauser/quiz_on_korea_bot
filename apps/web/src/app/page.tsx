'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bot, Flame, GraduationCap, Sparkles, Trophy, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { LanguageSwitcher } from '@/components/language-switcher';
import { SearchTrigger } from '@/components/search-trigger';
import { useTranslations } from '@/i18n/use-translations';
import { Button } from '@/shared/ui/button';

const WELCOME_KEY = 'pair-welcome-seen';

function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-primary/25 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-secondary/25 blur-[60px]" />

        <div className="relative flex justify-center bg-gradient-to-b from-primary/10 to-transparent pb-2 pt-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/penguin-hello.png" alt="pAIr mascot" className="h-44 w-auto drop-shadow-xl" />
          </motion.div>
        </div>

        <div className="px-6 pb-6 pt-4 text-center">
          <h2 className="text-2xl font-black tracking-tight">안녕하세요! 👋</h2>
          <p className="mt-1 text-sm font-semibold text-primary">pAIr에 오신 것을 환영합니다</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            AI와 함께하는 재미있는 한국어 학습 여정을 시작해 보세요.
            게임처럼 배우고, 순위표에서 경쟁하세요!
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['🎮 게임식 학습', '🏆 글로벌 순위', '🤖 AI 튜터'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/dashboard" onClick={onClose}>
              <Button variant="gradient" size="lg" className="w-full">
                지금 시작하기 <ArrowRight className="size-4" />
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              나중에 시작하기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { t } = useTranslations();
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(WELCOME_KEY)) {
      const timer = setTimeout(() => setShowWelcome(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_KEY, '1');
    }
  };

  const FEATURES = [
    { icon: GraduationCap, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
    { icon: Flame, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
    { icon: Bot, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
    { icon: Trophy, titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc' },
  ] as const;

  const STEPS = [
    { n: '01', titleKey: 'landing.step1Title', descKey: 'landing.step1Desc' },
    { n: '02', titleKey: 'landing.step2Title', descKey: 'landing.step2Desc' },
    { n: '03', titleKey: 'landing.step3Title', descKey: 'landing.step3Desc' },
  ] as const;

  return (
    <React.Fragment>
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={closeWelcome} />}
      </AnimatePresence>

      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <img src="/penguin-hello.png" alt="pAIr logo" className="size-9 rounded-xl object-contain" />
            <span className="font-extrabold">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <SearchTrigger className="hidden sm:flex sm:max-w-[14rem]" />
            <SearchTrigger compact className="sm:hidden" />
            <LanguageSwitcher variant="full" className="hidden sm:inline-flex" />
            <LanguageSwitcher className="sm:hidden" />
            <Link href="/dashboard">
              <Button variant="gradient" className="px-3 sm:px-4">
                <span className="hidden sm:inline">{t('common.launchApp')}</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pt-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground"
              >
                <Sparkles className="size-4 text-primary" /> {t('landing.badge')}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-balance text-[2.75rem] font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                {t('landing.heroTitle1')}
                <br />
                <span className="text-gradient">{t('landing.heroTitle2')}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0"
              >
                {t('landing.heroDesc')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              >
                <Link href="/dashboard">
                  <Button variant="gradient" size="lg">
                    {t('common.startDemo')} <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/tutor">
                  <Button variant="outline" size="lg">
                    {t('common.meetTutor')}
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:gap-6 lg:justify-start"
              >
                <span>{t('landing.statCountries')}</span>
                <span>{t('landing.statWords')}</span>
                <span>{t('landing.statTopik')}</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              className="relative flex shrink-0 items-center justify-center"
            >
              <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-[60px]" />
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="/penguin-hello.png"
                  alt="pAIr mascot"
                  className="w-56 drop-shadow-2xl sm:w-72 lg:w-80 xl:w-96"
                />
              </motion.div>
            </motion.div>

          </div>
        </section>

        <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-2xl border border-border bg-card/60 p-5"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                <f.icon className="size-6" />
              </span>
              <div>
                <h3 className="font-bold">{t(f.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(f.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card/40 p-6"
              >
                <span className="text-3xl font-black text-gradient">{s.n}</span>
                <h3 className="mt-3 font-bold">{t(s.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(s.descKey)}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 to-secondary/15 p-6 text-center sm:p-10">
            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">{t('landing.ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('landing.ctaDesc')}</p>
            <Link href="/dashboard" className="mt-7 inline-block">
              <Button variant="gradient" size="lg">
                {t('common.enterApp')} <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
}
