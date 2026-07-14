'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Bot,
  CornerDownLeft,
  Globe,
  History,
  LogOut,
  Monitor,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { LOCALE_META, LOCALES, type Locale } from '@/i18n/config';
import type { TranslationKey } from '@/i18n/dictionaries';
import { useTranslations } from '@/i18n/use-translations';
import { NAV } from '@/lib/nav';
import { buildHaystack, rankSearchItems, type SearchGroup } from '@/lib/search';
import { useAchievements } from '@/shared/api/hooks/use-achievements';
import { useLogout } from '@/shared/api/hooks/use-auth';
import { useLessons } from '@/shared/api/hooks/use-lessons';
import { cn } from '@/shared/lib/utils';
import { useLessonPlayerStore } from '@/store/use-lesson-player-store';
import { useLocaleStore } from '@/store/use-locale-store';
import { useToastStore } from '@/store/use-toast-store';
import { useUiStore } from '@/store/use-ui-store';

interface Command {
  id: string;
  group: SearchGroup | 'recent';
  label: string;
  hint?: string;
  haystack: string;
  node: React.ReactNode;
  action: () => void;
}

const GROUP_ORDER: Array<SearchGroup | 'recent'> = [
  'recent',
  'pages',
  'lessons',
  'vocabulary',
  'achievements',
  'actions',
];

const GROUP_LABEL_KEYS: Record<SearchGroup | 'recent', TranslationKey> = {
  recent: 'search.group.recent',
  pages: 'search.group.pages',
  lessons: 'search.group.lessons',
  vocabulary: 'search.group.vocabulary',
  achievements: 'search.group.achievements',
  actions: 'search.group.actions',
};

function useShortcutLabel() {
  const [label, setLabel] = React.useState('Ctrl K');

  React.useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    setLabel(mac ? '⌘K' : 'Ctrl K');
  }, []);

  return label;
}

export function CommandPalette() {
  const { t } = useTranslations();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const toggle = useUiStore((s) => s.toggleCommand);
  const recentQueries = useUiStore((s) => s.recentQueries);
  const pushRecentQuery = useUiStore((s) => s.pushRecentQuery);
  const clearRecentQueries = useUiStore((s) => s.clearRecentQueries);

  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: lessons } = useLessons();
  const { data: achievementsList } = useAchievements();
  const setActiveLesson = useLessonPlayerStore((s) => s.setActiveLesson);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const toast = useToastStore((s) => s.toast);
  const logout = useLogout();
  const shortcut = useShortcutLabel();

  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  React.useEffect(() => {
    if (!open) return undefined;

    setQuery('');
    setActive(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(timer);
  }, [open]);

  const close = React.useCallback(() => setOpen(false), [setOpen]);

  const executeCommand = React.useCallback(
    (command: Command | undefined) => {
      if (!command) return;

      if (command.group === 'recent') {
        setQuery(command.label);
        return;
      }

      if (query.trim()) pushRecentQuery(query);
      setOpen(false);
      command.action();
    },
    [pushRecentQuery, query, setOpen],
  );

  const openLesson = React.useCallback(
    (lessonId: string) => {
      router.push('/learn');
      const lesson = lessons?.find((l) => l.id === lessonId);
      if (lesson?.unlocked) {
        setActiveLesson(lessonId);
      } else {
        toast({
          icon: '🔒',
          title: t('search.lessonLocked.title'),
          description: t('search.lessonLocked.desc'),
        });
      }
    },
    [router, lessons, setActiveLesson, toast, t],
  );

  const commands = React.useMemo<Command[]>(() => {
    const pages: Command[] = NAV.map((n) => ({
      id: `page-${n.href}`,
      group: 'pages',
      label: t(n.labelKey),
      haystack: buildHaystack([t(n.labelKey), n.href.replace('/', ''), 'page navigate go open']),
      node: <n.icon className="size-4" />,
      action: () => router.push(n.href),
    }));

    const lessonCommands: Command[] = (lessons ?? []).map((l) => ({
      id: `lesson-${l.id}`,
      group: 'lessons',
      label: l.title,
      hint: l.category.parent?.name ?? l.category.name,
      haystack: buildHaystack([l.title, l.description, l.category.name, l.difficulty, 'lesson']),
      node: <span className="text-base leading-none">📘</span>,
      action: () => openLesson(l.id),
    }));

    const achievements: Command[] = (achievementsList ?? []).map((a) => ({
      id: `achievement-${a.id}`,
      group: 'achievements',
      label: a.title,
      hint: a.description,
      haystack: buildHaystack([a.title, a.description, 'achievement badge']),
      node: <Award className="size-4" />,
      action: () => router.push('/achievements'),
    }));

    const actions: Command[] = [
      {
        id: 'action-tutor',
        group: 'actions',
        label: t('search.action.tutor'),
        haystack: buildHaystack([t('search.action.tutor'), 'ai tutor chat help ask bot']),
        node: <Bot className="size-4" />,
        action: () => router.push('/tutor'),
      },
      {
        id: 'action-light',
        group: 'actions',
        label: t('search.action.themeLight'),
        haystack: buildHaystack([t('search.action.themeLight'), 'theme light mode appearance']),
        node: <Sun className="size-4" />,
        action: () => setTheme('light'),
      },
      {
        id: 'action-dark',
        group: 'actions',
        label: t('search.action.themeDark'),
        haystack: buildHaystack([t('search.action.themeDark'), 'theme dark mode appearance']),
        node: <Moon className="size-4" />,
        action: () => setTheme('dark'),
      },
      {
        id: 'action-system',
        group: 'actions',
        label: t('search.action.themeSystem'),
        haystack: buildHaystack([t('search.action.themeSystem'), 'theme system mode appearance']),
        node: <Monitor className="size-4" />,
        action: () => setTheme('system'),
      },
      ...LOCALES.map((code) => ({
        id: `action-locale-${code}`,
        group: 'actions' as const,
        label: t(code === 'en' ? 'search.action.languageEn' : 'search.action.languageKo'),
        haystack: buildHaystack([
          LOCALE_META[code].nativeLabel,
          code,
          'language locale switch',
          t(code === 'en' ? 'search.action.languageEn' : 'search.action.languageKo'),
        ]),
        node: <Globe className="size-4" />,
        action: () => setLocale(code as Locale),
      })),
      {
        id: 'action-logout',
        group: 'actions',
        label: t('account.logOut'),
        haystack: buildHaystack([t('account.logOut'), 'log out sign out logout']),
        node: <LogOut className="size-4" />,
        action: () => logout.mutate(undefined, { onSuccess: () => router.push('/login') }),
      },
    ];

    return [...pages, ...lessonCommands, ...achievements, ...actions];
  }, [router, lessons, achievementsList, openLesson, setTheme, setLocale, logout, t]);

  const recentCommands = React.useMemo<Command[]>(
    () =>
      recentQueries.map((q) => ({
        id: `recent-${q}`,
        group: 'recent' as const,
        label: q,
        haystack: q.toLowerCase(),
        node: <History className="size-4" />,
        action: () => setQuery(q),
      })),
    [recentQueries],
  );

  const filtered = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return recentCommands.length > 0 ? [...recentCommands, ...commands] : commands;
    }

    const ranked = rankSearchItems(
      commands.map(({ id, group, label, hint, haystack }) => ({
        id,
        group: group as SearchGroup,
        label,
        hint,
        haystack,
      })),
      trimmed,
    ).map((item) => commands.find((c) => c.id === item.id)!);
    const recentMatches = recentCommands.filter((c) =>
      c.haystack.includes(trimmed.toLowerCase()),
    );

    return [...recentMatches, ...ranked];
  }, [commands, recentCommands, query]);

  React.useEffect(() => setActive(0), [query]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const execute = executeCommand;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh] sm:pt-[12vh]"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label={t('search.close')}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('search.title')}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative z-10 w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded
                aria-controls={listboxId}
                aria-activedescendant={filtered[active] ? `search-option-${active}` : undefined}
                aria-autocomplete="list"
                placeholder={t('search.placeholder')}
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">
                Esc
              </kbd>
            </div>

            <div ref={listRef} id={listboxId} role="listbox" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  {t('search.noResults', { query })}
                </p>
              )}

              {GROUP_ORDER.map((group) => {
                const groupItems = filtered.filter((c) => c.group === group);
                if (groupItems.length === 0) return null;

                return (
                  <div key={group} className="mb-1">
                    <div className="flex items-center justify-between px-3 pb-1 pt-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t(GROUP_LABEL_KEYS[group])}
                      </div>
                      {group === 'recent' && (
                        <button
                          type="button"
                          onClick={clearRecentQueries}
                          className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {t('search.clearRecent')}
                        </button>
                      )}
                    </div>
                    {groupItems.map((c) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const isActive = index === active;
                      return (
                        <button
                          key={c.id}
                          id={`search-option-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          data-index={index}
                          onMouseMove={() => setActive(index)}
                          onClick={() => execute(c)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                            isActive ? 'bg-accent' : 'hover:bg-accent/60',
                          )}
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                            {c.node}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{c.label}</span>
                            {c.hint && (
                              <span className="block truncate text-xs text-muted-foreground">{c.hint}</span>
                            )}
                          </span>
                          {isActive && <CornerDownLeft className="size-4 shrink-0 text-muted-foreground" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">↑</kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">↓</kbd>
                {t('search.navigate')}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] sm:inline">
                  {shortcut}
                </kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">↵</kbd>
                {t('search.select')}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
