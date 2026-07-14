import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class EquipRewardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, rewardId: string) {
    const item = await this.prisma.inventory.findUnique({
      where: { userId_rewardId: { userId, rewardId } },
      include: { reward: true },
    });
    if (!item) {
      throw new NotFoundException('You do not own this reward.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Only one item of a given type (avatar, theme, title) can be equipped at once.
      await tx.inventory.updateMany({
        where: { userId, equipped: true, reward: { type: item.reward.type } },
        data: { equipped: false },
      });

      return tx.inventory.update({
        where: { userId_rewardId: { userId, rewardId } },
        data: { equipped: true },
        include: { reward: true },
      });
    });
  }
}
