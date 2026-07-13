import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetLessonQuizzesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(lessonId: string) {
    const quizzes = await this.prisma.quizTemplate.findMany({
      where: { lessonId, deletedAt: null },
      include: {
        questions: {
          include: { options: { select: { id: true, text: true, order: true } } },
        },
      },
    });

    // Never expose `isCorrect` / `correctAnswer` before an attempt is graded.
    return quizzes.map((quiz) => ({
      ...quiz,
      questions: quiz.questions.map(({ correctAnswer: _correctAnswer, ...question }) => question),
    }));
  }
}
