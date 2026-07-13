import { describe, expect, it } from 'vitest';

import { buildHaystack, rankSearchItems, scoreSearchItem, tokenizeQuery, type SearchItem } from './search';

const item = (overrides: Partial<SearchItem> & Pick<SearchItem, 'id' | 'label' | 'haystack'>): SearchItem => ({
  group: 'lessons',
  ...overrides,
});

describe('tokenizeQuery', () => {
  it('splits on whitespace and lowercases', () => {
    expect(tokenizeQuery('  Airport  PASSPORT ')).toEqual(['airport', 'passport']);
  });
});

describe('scoreSearchItem', () => {
  it('prefers exact label matches', () => {
    const exact = item({
      id: '1',
      label: 'passport',
      haystack: 'passport|여권 yeogwon',
      group: 'vocabulary',
    });
    const partial = item({
      id: '2',
      label: 'At the Airport',
      haystack: 'at the airport arrival',
      group: 'lessons',
    });

    expect(scoreSearchItem(exact, ['passport'])).toBeGreaterThan(scoreSearchItem(partial, ['passport']));
  });

  it('matches Korean characters', () => {
    const vocab = item({
      id: 'v1',
      label: '여권',
      haystack: buildHaystack(['여권', 'yeogwon', 'passport']),
      group: 'vocabulary',
    });

    expect(scoreSearchItem(vocab, ['여권'])).toBeGreaterThan(0);
    expect(scoreSearchItem(vocab, ['yeogwon'])).toBeGreaterThan(0);
  });

  it('requires every token to match', () => {
    const lesson = item({
      id: 'l1',
      label: 'At the Airport',
      haystack: buildHaystack(['at the airport', 'arrival']),
    });

    expect(scoreSearchItem(lesson, ['airport', 'arrival'])).toBeGreaterThan(0);
    expect(scoreSearchItem(lesson, ['airport', 'cafeteria'])).toBe(0);
  });
});

describe('rankSearchItems', () => {
  it('returns all items for an empty query', () => {
    const items = [
      item({ id: '1', label: 'A', haystack: 'a' }),
      item({ id: '2', label: 'B', haystack: 'b' }),
    ];

    expect(rankSearchItems(items, '')).toHaveLength(2);
  });

  it('filters and ranks by relevance', () => {
    const items = [
      item({ id: '1', label: 'Dashboard', haystack: 'dashboard home', group: 'pages' }),
      item({ id: '2', label: 'At the Airport', haystack: 'at the airport arrival', group: 'lessons' }),
      item({ id: '3', label: '여권', haystack: '여권 yeogwon passport airport', group: 'vocabulary' }),
    ];

    const ranked = rankSearchItems(items, 'airport');
    expect(ranked.map((i) => i.id)).toEqual(['2', '3']);
  });
});
