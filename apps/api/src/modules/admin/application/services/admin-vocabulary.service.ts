import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { type CreateVocabularyDto, type UpdateVocabularyDto } from '../../presentation/dto/admin-vocabulary.dto';

@Injectable()
export class AdminVocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  createVocabulary(dto: CreateVocabularyDto) {
    const { exampleSentences, ...data } = dto;
    return this.prisma.vocabulary.create({
      data: {
        ...data,
        exampleSentences: exampleSentences?.length ? { create: exampleSentences } : undefined,
      },
      include: { exampleSentences: true },
    });
  }

  async updateVocabulary(id: string, dto: UpdateVocabularyDto) {
    await this.requireVocabulary(id);
    return this.prisma.vocabulary.update({ where: { id }, data: dto });
  }

  async deleteVocabulary(id: string) {
    await this.requireVocabulary(id);
    await this.prisma.vocabulary.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireVocabulary(id: string): Promise<void> {
    const found = await this.prisma.vocabulary.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Vocabulary not found');
    }
  }
}
