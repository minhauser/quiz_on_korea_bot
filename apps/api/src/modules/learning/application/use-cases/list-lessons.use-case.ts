import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListLessonsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string | undefined) {
    const [lessons, profile] = await Promise.all([
      this.prisma.lesson.findMany({
        where: { deletedAt: null, status: 'PUBLISHED' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              parentCategoryId: true,
              parent: { select: { id: true, name: true } },
            },
          },
          progress: userId ? { where: { userId } } : false,
          _count: { select: { vocabulary: true } },
        },
        orderBy: [{ category: { sortOrder: 'asc' } }, { order: 'asc' }],
      }),
      userId
        ? this.prisma.userProfile.findUnique({ where: { userId }, select: { currentLevel: true } })
        : null,
    ]);

    const currentLevel = profile?.currentLevel ?? 1;

    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      estimatedTime: lesson.estimatedTime,
      xpReward: lesson.xpReward,
      unlockLevel: lesson.unlockLevel,
      order: lesson.order,
      category: lesson.category,
      vocabularyCount: lesson._count.vocabulary,
      unlocked: lesson.unlockLevel <= currentLevel,
      progress: userId ? (lesson.progress[0] ?? null) : null,
    }));
  }
}
