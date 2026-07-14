import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetLessonQuizzesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(lessonId: string) {
    return this.prisma.quizTemplate.findMany({
      where: { lessonId, deletedAt: null },
      include: {
        questions: {
          include: { options: { select: { id: true, text: true, order: true, isCorrect: true } } },
        },
      },
    });
  }
}
