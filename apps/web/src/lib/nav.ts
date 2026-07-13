import { Award, BarChart3, Bot, BookOpen, LayoutDashboard, Trophy, Users } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

import type { TranslationKey } from '@/i18n/dictionaries';

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/learn', labelKey: 'nav.learn', icon: BookOpen },
  { href: '/tutor', labelKey: 'nav.tutor', icon: Bot },
  { href: '/leaderboard', labelKey: 'nav.leaderboard', icon: Trophy },
  { href: '/stats', labelKey: 'nav.stats', icon: BarChart3 },
  { href: '/achievements', labelKey: 'nav.achievements', icon: Award },
  { href: '/developers', labelKey: 'nav.developers', icon: Users },
];

export interface NavSection {
  labelKey: TranslationKey;
  items: NavItem[];
}

/** Grouped navigation for the desktop sidebar. */
export const NAV_SECTIONS: NavSection[] = [
  { labelKey: 'navSection.learn', items: NAV.slice(0, 3) },
  { labelKey: 'navSection.progress', items: NAV.slice(3) },
];

/** Lookup a human label for the current path (page context / breadcrumb). */
export function labelForPath(pathname: string, t: (key: TranslationKey) => string): string {
  const match = NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  return match ? t(match.labelKey) : t('common.home');
}
