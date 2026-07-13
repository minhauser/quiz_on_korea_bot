import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetLessonUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(lessonId: string, userId: string | undefined) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null, status: 'PUBLISHED' },
      include: {
        vocabulary: { include: { exampleSentences: true } },
        grammar: { include: { examples: { orderBy: { order: 'asc' } } } },
        dialogues: { include: { lines: { orderBy: { order: 'asc' } } } },
        quizzes: { select: { id: true, title: true, type: true, difficulty: true } },
        progress: userId ? { where: { userId } } : false,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    return { ...lesson, progress: userId ? (lesson.progress[0] ?? null) : null };
  }
}
