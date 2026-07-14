import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

const RARITY_COST: Record<string, number> = {
  COMMON: 50,
  RARE: 150,
  EPIC: 400,
  LEGENDARY: 1000,
};

@Injectable()
export class ListRewardsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const [rewards, owned] = await Promise.all([
      this.prisma.reward.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } }),
      this.prisma.inventory.findMany({ where: { userId } }),
    ]);

    const ownedByReward = new Map(owned.map((o) => [o.rewardId, o]));

    return rewards.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      icon: r.icon,
      rarity: r.rarity,
      description: r.description,
      cost: RARITY_COST[r.rarity] ?? 100,
      owned: ownedByReward.has(r.id),
      equipped: ownedByReward.get(r.id)?.equipped ?? false,
    }));
  }
}

export { RARITY_COST };
