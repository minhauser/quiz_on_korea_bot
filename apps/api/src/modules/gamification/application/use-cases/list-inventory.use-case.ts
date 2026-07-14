import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListInventoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(userId: string) {
    return this.prisma.inventory.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
