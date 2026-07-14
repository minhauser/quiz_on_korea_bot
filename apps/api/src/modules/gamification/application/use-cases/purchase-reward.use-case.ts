import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

import { RARITY_COST } from './list-rewards.use-case';

@Injectable()
export class PurchaseRewardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, rewardId: string) {
    const reward = await this.prisma.reward.findFirst({ where: { id: rewardId, deletedAt: null } });
    if (!reward) {
      throw new NotFoundException('Reward not found.');
    }
    const cost = RARITY_COST[reward.rarity] ?? 100;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.inventory.findUnique({
        where: { userId_rewardId: { userId, rewardId } },
      });
      if (existing) {
        throw new BadRequestException('Reward already owned.');
      }

      const profile = await tx.userProfile.findUniqueOrThrow({ where: { userId }, select: { coins: true } });
      if (profile.coins < cost) {
        throw new BadRequestException('Not enough coins.');
      }

      await tx.userProfile.update({ where: { userId }, data: { coins: { decrement: cost } } });

      return tx.inventory.create({
        data: { userId, rewardId, quantity: 1 },
        include: { reward: true },
      });
    });
  }
}
