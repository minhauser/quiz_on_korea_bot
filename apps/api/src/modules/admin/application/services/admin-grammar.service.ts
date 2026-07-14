import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { type CreateGrammarDto, type UpdateGrammarDto } from '../../presentation/dto/admin-grammar.dto';

@Injectable()
export class AdminGrammarService {
  constructor(private readonly prisma: PrismaService) {}

  createGrammar(dto: CreateGrammarDto) {
    const { examples, ...data } = dto;
    return this.prisma.grammar.create({
      data: {
        ...data,
        examples: examples?.length ? { create: examples } : undefined,
      },
      include: { examples: true },
    });
  }

  async updateGrammar(id: string, dto: UpdateGrammarDto) {
    await this.requireGrammar(id);
    return this.prisma.grammar.update({ where: { id }, data: dto });
  }

  async deleteGrammar(id: string) {
    await this.requireGrammar(id);
    await this.prisma.grammar.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireGrammar(id: string): Promise<void> {
    const found = await this.prisma.grammar.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Grammar not found');
    }
  }
}
