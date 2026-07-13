import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class StartLessonUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    return this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, startedAt: new Date() },
      update: {},
    });
  }
}
