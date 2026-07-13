import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** XP needed to reach the *next* level from the start of `level`. */
export function xpForLevel(level: number): number {
  return Math.round(120 * Math.pow(level, 1.45));
}

export interface LevelInfo {
  level: number;
  rank: string;
  intoLevel: number;
  span: number;
  progress: number; // 0..1
}

const RANKS = [
  'New Applicant',
  'Accepted Student',
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Research Student',
  'Master Student',
  'PhD Candidate',
  'Graduate',
];

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const span = xpForLevel(level);
  return {
    level,
    rank: RANKS[Math.min(level - 1, RANKS.length - 1)] ?? 'Graduate',
    intoLevel: remaining,
    span,
    progress: Math.max(0, Math.min(1, remaining / span)),
  };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
