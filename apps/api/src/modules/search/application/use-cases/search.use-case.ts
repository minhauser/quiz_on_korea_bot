import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export type SearchResultType = 'lesson' | 'vocabulary' | 'grammar';

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string | null;
  score: number;
}

const MIN_SIMILARITY = 0.15;
const LIMIT_PER_TYPE = 10;

@Injectable()
export class SearchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: string): Promise<SearchResultItem[]> {
    const q = query.trim();
    if (!q) {
      return [];
    }

    const [lessons, vocabulary, grammar] = await Promise.all([
      this.prisma.$queryRaw<Array<{ id: string; title: string; score: number }>>`
        SELECT id, title, similarity(title, ${q}) AS score
        FROM lessons
        WHERE deleted_at IS NULL AND status = 'PUBLISHED' AND similarity(title, ${q}) > ${MIN_SIMILARITY}
        ORDER BY score DESC
        LIMIT ${LIMIT_PER_TYPE}
      `,
      this.prisma.$queryRaw<Array<{ id: string; word: string; translation: string; score: number }>>`
        SELECT id, word, translation,
          GREATEST(similarity(word, ${q}), similarity(translation, ${q})) AS score
        FROM vocabulary
        WHERE deleted_at IS NULL
          AND GREATEST(similarity(word, ${q}), similarity(translation, ${q})) > ${MIN_SIMILARITY}
        ORDER BY score DESC
        LIMIT ${LIMIT_PER_TYPE}
      `,
      this.prisma.$queryRaw<Array<{ id: string; title: string; score: number }>>`
        SELECT id, title, similarity(title, ${q}) AS score
        FROM grammar
        WHERE deleted_at IS NULL AND similarity(title, ${q}) > ${MIN_SIMILARITY}
        ORDER BY score DESC
        LIMIT ${LIMIT_PER_TYPE}
      `,
    ]);

    const results: SearchResultItem[] = [
      ...lessons.map((l) => ({
        type: 'lesson' as const,
        id: l.id,
        title: l.title,
        subtitle: null,
        score: l.score,
      })),
      ...vocabulary.map((v) => ({
        type: 'vocabulary' as const,
        id: v.id,
        title: v.word,
        subtitle: v.translation,
        score: v.score,
      })),
      ...grammar.map((g) => ({
        type: 'grammar' as const,
        id: g.id,
        title: g.title,
        subtitle: null,
        score: g.score,
      })),
    ];

    return results.sort((a, b) => b.score - a.score);
  }
}
