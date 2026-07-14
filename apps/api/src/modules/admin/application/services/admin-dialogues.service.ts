import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { type CreateDialogueDto, type UpdateDialogueDto } from '../../presentation/dto/admin-dialogues.dto';

@Injectable()
export class AdminDialoguesService {
  constructor(private readonly prisma: PrismaService) {}

  createDialogue(dto: CreateDialogueDto) {
    const { lines, ...data } = dto;
    return this.prisma.dialogue.create({
      data: {
        ...data,
        lines: lines?.length ? { create: lines } : undefined,
      },
      include: { lines: true },
    });
  }

  async updateDialogue(id: string, dto: UpdateDialogueDto) {
    await this.requireDialogue(id);
    return this.prisma.dialogue.update({ where: { id }, data: dto });
  }

  async deleteDialogue(id: string) {
    await this.requireDialogue(id);
    await this.prisma.dialogue.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireDialogue(id: string): Promise<void> {
    const found = await this.prisma.dialogue.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Dialogue not found');
    }
  }
}
