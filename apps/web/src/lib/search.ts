export type SearchGroup = 'pages' | 'lessons' | 'vocabulary' | 'achievements' | 'actions';

export interface SearchItem {
  id: string;
  group: SearchGroup;
  label: string;
  hint?: string;
  /** Lowercase haystack used for matching. */
  haystack: string;
}

const GROUP_RANK: Record<SearchGroup, number> = {
  pages: 0,
  lessons: 1,
  vocabulary: 2,
  achievements: 3,
  actions: 4,
};

/** Split a query into normalized search tokens. */
export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function scoreToken(haystack: string, token: string): number {
  if (!token) return 0;

  const label = haystack.split('|')[0]?.trim() ?? haystack;

  if (label === token) return 120;
  if (label.startsWith(token)) return 90;
  if (label.includes(token)) return 70;

  if (haystack.includes(token)) return 50;

  // Lightweight fuzzy match: characters appear in order.
  let cursor = 0;
  for (const char of token) {
    const next = haystack.indexOf(char, cursor);
    if (next === -1) return 0;
    cursor = next + 1;
  }

  return 25;
}

/** Score how well an item matches all query tokens. Returns 0 when no match. */
export function scoreSearchItem(item: SearchItem, tokens: string[]): number {
  if (tokens.length === 0) return 1;

  let total = 0;
  for (const token of tokens) {
    const tokenScore = scoreToken(item.haystack, token);
    if (tokenScore === 0) return 0;
    total += tokenScore;
  }

  return total + Math.max(0, 10 - GROUP_RANK[item.group]);
}

export function rankSearchItems<T extends SearchItem>(items: T[], query: string): T[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return items;

  return items
    .map((item) => ({ item, score: scoreSearchItem(item, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .map(({ item }) => item);
}

export function buildHaystack(parts: Array<string | undefined | null>): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
