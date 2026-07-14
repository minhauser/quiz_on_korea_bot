import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

const PAGE_SIZE = 20;

@Injectable()
export class ListNotificationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
      }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { items, unreadCount };
  }
}
