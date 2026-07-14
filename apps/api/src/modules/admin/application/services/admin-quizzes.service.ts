import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { type CreateQuizDto, type UpdateQuizDto } from '../../presentation/dto/admin-quizzes.dto';

@Injectable()
export class AdminQuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  createQuiz(dto: CreateQuizDto) {
    const { questions, ...data } = dto;
    return this.prisma.quizTemplate.create({
      data: {
        ...data,
        questions: questions?.length
          ? {
              create: questions.map(({ options, ...question }) => ({
                ...question,
                options: options?.length ? { create: options } : undefined,
              })),
            }
          : undefined,
      },
      include: { questions: { include: { options: true } } },
    });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    await this.requireQuiz(id);
    return this.prisma.quizTemplate.update({ where: { id }, data: dto });
  }

  async deleteQuiz(id: string) {
    await this.requireQuiz(id);
    await this.prisma.quizTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireQuiz(id: string): Promise<void> {
    const found = await this.prisma.quizTemplate.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Quiz not found');
    }
  }
}
