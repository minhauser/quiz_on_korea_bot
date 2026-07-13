import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { XpRewardService } from '../../../../shared/infrastructure/gameplay/xp-reward.service';

// Days until next review, indexed by mastery level (0–5) after this attempt.
const REVIEW_INTERVAL_DAYS = [1, 1, 3, 7, 14, 30];
const XP_PER_CORRECT_REVIEW = 2;

export interface ReviewVocabularyCommand {
  wordId: string;
  userId: string;
  correct: boolean;
}

@Injectable()
export class ReviewVocabularyUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpReward: XpRewardService,
  ) {}

  async execute(command: ReviewVocabularyCommand) {
    const word = await this.prisma.vocabulary.findFirst({
      where: { id: command.wordId, deletedAt: null },
      select: { id: true },
    });
    if (!word) {
      throw new NotFoundException('Vocabulary word not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.vocabularyProgress.findUnique({
        where: { userId_wordId: { userId: command.userId, wordId: command.wordId } },
      });

      const currentMastery = existing?.masteryLevel ?? 0;
      const masteryLevel = command.correct
        ? Math.min(5, currentMastery + 1)
        : Math.max(0, currentMastery - 1);
      const nextReview = addDays(new Date(), REVIEW_INTERVAL_DAYS[masteryLevel] ?? 1);
      const isFirstReview = !existing;

      const progress = await tx.vocabularyProgress.upsert({
        where: { userId_wordId: { userId: command.userId, wordId: command.wordId } },
        create: {
          userId: command.userId,
          wordId: command.wordId,
          timesSeen: 1,
          timesCorrect: command.correct ? 1 : 0,
          timesWrong: command.correct ? 0 : 1,
          masteryLevel,
          lastReview: new Date(),
          nextReview,
        },
        update: {
          timesSeen: { increment: 1 },
          timesCorrect: command.correct ? { increment: 1 } : undefined,
          timesWrong: command.correct ? undefined : { increment: 1 },
          masteryLevel,
          lastReview: new Date(),
          nextReview,
        },
      });

      if (command.correct) {
        await this.xpReward.award(tx, command.userId, {
          xp: XP_PER_CORRECT_REVIEW,
          wordsLearned: isFirstReview ? 1 : 0,
        });
      }

      return progress;
    });
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
