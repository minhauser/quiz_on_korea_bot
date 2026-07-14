import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { type CreateLessonDto, type UpdateLessonDto } from '../../presentation/dto/admin-learning.dto';

@Injectable()
export class AdminLearningService {
  constructor(private readonly prisma: PrismaService) {}

  createLesson(dto: CreateLessonDto) {
    return this.prisma.lesson.create({ data: dto });
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    await this.requireLesson(id);
    return this.prisma.lesson.update({ where: { id }, data: dto });
  }

  async deleteLesson(id: string) {
    await this.requireLesson(id);
    await this.prisma.lesson.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireLesson(id: string): Promise<void> {
    const found = await this.prisma.lesson.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Lesson not found');
    }
  }
}
