import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListVocabularyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(lessonId: string, userId: string) {
    const words = await this.prisma.vocabulary.findMany({
      where: { lessonId, deletedAt: null },
      include: {
        exampleSentences: true,
        progress: { where: { userId } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return words.map((w) => ({ ...w, progress: w.progress[0] ?? null }));
  }
}
