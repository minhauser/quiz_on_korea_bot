import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { XpRewardService } from '../../../../shared/infrastructure/gameplay/xp-reward.service';

export interface CompleteLessonCommand {
  lessonId: string;
  userId: string;
  score?: number;
}

@Injectable()
export class CompleteLessonUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpReward: XpRewardService,
  ) {}

  async execute(command: CompleteLessonCommand) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: command.lessonId, deletedAt: null, status: 'PUBLISHED' },
      select: { id: true, xpReward: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: command.userId, lessonId: command.lessonId } },
      });
      const isFirstCompletion = !existing?.completedAt;

      const progress = await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: command.userId, lessonId: command.lessonId } },
        create: {
          userId: command.userId,
          lessonId: command.lessonId,
          startedAt: new Date(),
          completedAt: new Date(),
          completion: 100,
          score: command.score,
          mastery: command.score ?? 0,
        },
        update: {
          completedAt: new Date(),
          completion: 100,
          score: command.score,
          mastery: command.score ?? existing?.mastery,
        },
      });

      let xpAwarded = 0;
      let coinsAwarded = 0;
      if (isFirstCompletion) {
        xpAwarded = lesson.xpReward;
        coinsAwarded = Math.floor(lesson.xpReward / 2);
        await this.xpReward.award(tx, command.userId, {
          xp: xpAwarded,
          coins: coinsAwarded,
          lessonsCompleted: 1,
        });
      }

      return { progress, xpAwarded, coinsAwarded, firstCompletion: isFirstCompletion };
    });
  }
}
