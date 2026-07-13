import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListGrammarUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(lessonId: string) {
    return this.prisma.grammar.findMany({
      where: { lessonId, deletedAt: null },
      include: { examples: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
