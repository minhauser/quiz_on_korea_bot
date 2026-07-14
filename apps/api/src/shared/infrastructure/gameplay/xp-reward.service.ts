import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { RedisService } from '../redis/redis.service';

type Tx = Prisma.TransactionClient;

export interface XpDelta {
  xp: number;
  coins?: number;
  lessonsCompleted?: number;
  quizzesCompleted?: number;
  wordsLearned?: number;
  wordsMastered?: number;
}

export interface XpAwardResult {
  /** True when this is the first XP-earning action recorded for the user today (drives streak). */
  isFirstActionToday: boolean;
  streak: number;
}

export const LEADERBOARD_ALLTIME_KEY = 'leaderboard:alltime';
export const LEADERBOARD_WEEKLY_KEY = 'leaderboard:weekly';

/**
 * Shared "award XP/coins for an action" routine used by lesson completion,
 * quiz attempts, and vocabulary review. Keeps UserProfile, Statistics,
 * DailyActivity, the Redis leaderboard, and the daily streak counter in sync
 * within the same transaction as the triggering write.
 */
@Injectable()
export class XpRewardService {
  constructor(private readonly redis: RedisService) {}

  async award(tx: Tx, userId: string, delta: XpDelta): Promise<XpAwardResult> {
    const coins = delta.coins ?? 0;
    const today = startOfDay(new Date());

    const existingToday = await tx.dailyActivity.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { id: true },
    });
    const isFirstActionToday = !existingToday;

    let streak = 0;
    if (isFirstActionToday) {
      const yesterday = addDays(today, -1);
      const hadYesterday = await tx.dailyActivity.findUnique({
        where: { userId_date: { userId, date: yesterday } },
        select: { id: true },
      });

      const profile = await tx.userProfile.findUniqueOrThrow({
        where: { userId },
        select: { streak: true, longestStreak: true },
      });
      streak = hadYesterday ? profile.streak + 1 : 1;
      const longestStreak = Math.max(profile.longestStreak, streak);

      await tx.userProfile.update({
        where: { userId },
        data: {
          xp: { increment: delta.xp },
          coins: { increment: coins },
          streak,
          longestStreak,
        },
      });
    } else {
      const profile = await tx.userProfile.update({
        where: { userId },
        data: { xp: { increment: delta.xp }, coins: { increment: coins } },
        select: { streak: true },
      });
      streak = profile.streak;
    }

    await tx.statistics.upsert({
      where: { userId },
      create: {
        userId,
        totalXp: delta.xp,
        lessonsCompleted: delta.lessonsCompleted ?? 0,
        wordsLearned: delta.wordsLearned ?? 0,
        wordsMastered: delta.wordsMastered ?? 0,
      },
      update: {
        totalXp: { increment: delta.xp },
        lessonsCompleted: delta.lessonsCompleted ? { increment: delta.lessonsCompleted } : undefined,
        wordsLearned: delta.wordsLearned ? { increment: delta.wordsLearned } : undefined,
        wordsMastered: delta.wordsMastered ? { increment: delta.wordsMastered } : undefined,
      },
    });

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

    if (delta.xp > 0) {
      await this.redis.client.zincrby(LEADERBOARD_ALLTIME_KEY, delta.xp, userId);
      await this.redis.client.zincrby(LEADERBOARD_WEEKLY_KEY, delta.xp, userId);
    }

    return { isFirstActionToday, streak };
  }
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
