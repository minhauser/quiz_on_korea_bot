import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListDialoguesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(lessonId: string) {
    return this.prisma.dialogue.findMany({
      where: { lessonId, deletedAt: null },
      include: { lines: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
