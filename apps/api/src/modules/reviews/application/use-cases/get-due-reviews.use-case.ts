import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetDueReviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const now = new Date();

    const [words, lessons] = await Promise.all([
      this.prisma.vocabularyProgress.findMany({
        where: { userId, nextReview: { lte: now } },
        include: { word: true },
        orderBy: { nextReview: 'asc' },
      }),
      this.prisma.lessonProgress.findMany({
        where: { userId, reviewDue: { lte: now } },
        include: { lesson: { select: { id: true, title: true, difficulty: true } } },
        orderBy: { reviewDue: 'asc' },
      }),
    ]);

    return { words, lessons };
  }
}
