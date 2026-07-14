import { Injectable } from '@nestjs/common';

import { LEADERBOARD_ALLTIME_KEY, LEADERBOARD_WEEKLY_KEY } from '../../../../shared/infrastructure/gameplay/xp-reward.service';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { RedisService } from '../../../../shared/infrastructure/redis/redis.service';

const TOP_N = 20;

@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string, period: 'alltime' | 'weekly' = 'alltime') {
    const key = period === 'weekly' ? LEADERBOARD_WEEKLY_KEY : LEADERBOARD_ALLTIME_KEY;

    const raw = await this.redis.client.zrevrange(key, 0, TOP_N - 1, 'WITHSCORES');
    const entries: { userId: string; xp: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      const memberId = raw[i];
      if (!memberId) continue;
      entries.push({ userId: memberId, xp: Number(raw[i + 1]) });
    }

    const profiles = await this.prisma.userProfile.findMany({
      where: { userId: { in: entries.map((e) => e.userId) } },
      select: { userId: true, nickname: true, avatar: true, currentLevel: true, country: true },
    });
    const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));

    const myRank = await this.redis.client.zrevrank(key, userId);
    const myScore = await this.redis.client.zscore(key, userId);

    return {
      period,
      entries: entries.map((e, index) => ({
        rank: index + 1,
        userId: e.userId,
        xp: e.xp,
        nickname: profileByUserId.get(e.userId)?.nickname ?? 'Unknown',
        avatar: profileByUserId.get(e.userId)?.avatar ?? null,
        currentLevel: profileByUserId.get(e.userId)?.currentLevel ?? 1,
        country: profileByUserId.get(e.userId)?.country ?? null,
        isCurrentUser: e.userId === userId,
      })),
      me: {
        rank: myRank === null ? null : myRank + 1,
        xp: myScore === null ? 0 : Number(myScore),
      },
    };
  }
}
