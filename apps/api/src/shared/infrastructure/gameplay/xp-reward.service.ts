import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

/**
 * Shared "award XP/coins for an action" routine used by lesson completion and
 * quiz attempts. Keeps UserProfile, Statistics, and DailyActivity in sync in
 * the same transaction as the triggering write.
 */
@Injectable()
export class XpRewardService {
  async award(
    tx: Tx,
    userId: string,
    delta: { xp: number; coins?: number; lessonsCompleted?: number; quizzesCompleted?: number; wordsLearned?: number },
  ): Promise<void> {
    const coins = delta.coins ?? 0;

    await tx.userProfile.update({
      where: { userId },
      data: { xp: { increment: delta.xp }, coins: { increment: coins } },
    });

    await tx.statistics.upsert({
      where: { userId },
      create: {
        userId,
        totalXp: delta.xp,
        lessonsCompleted: delta.lessonsCompleted ?? 0,
        wordsLearned: delta.wordsLearned ?? 0,
      },
      update: {
        totalXp: { increment: delta.xp },
        lessonsCompleted: delta.lessonsCompleted ? { increment: delta.lessonsCompleted } : undefined,
        wordsLearned: delta.wordsLearned ? { increment: delta.wordsLearned } : undefined,
      },
    });

    const today = startOfDay(new Date());
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        xpEarned: delta.xp,
        lessonsCompleted: delta.lessonsCompleted ?? 0,
        quizzesCompleted: delta.quizzesCompleted ?? 0,
        wordsLearned: delta.wordsLearned ?? 0,
      },
      update: {
        xpEarned: { increment: delta.xp },
        lessonsCompleted: delta.lessonsCompleted ? { increment: delta.lessonsCompleted } : undefined,
        quizzesCompleted: delta.quizzesCompleted ? { increment: delta.quizzesCompleted } : undefined,
        wordsLearned: delta.wordsLearned ? { increment: delta.wordsLearned } : undefined,
      },
    });
  }
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
