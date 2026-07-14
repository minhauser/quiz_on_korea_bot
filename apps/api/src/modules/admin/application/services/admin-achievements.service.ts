import { Injectable, NotFoundException } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { type CreateAchievementDto, type UpdateAchievementDto } from '../../presentation/dto/admin-achievements.dto';

@Injectable()
export class AdminAchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  createAchievement(dto: CreateAchievementDto) {
    return this.prisma.achievement.create({
      data: { ...dto, condition: dto.condition as Prisma.InputJsonValue },
    });
  }

  async updateAchievement(id: string, dto: UpdateAchievementDto) {
    await this.requireAchievement(id);
    return this.prisma.achievement.update({
      where: { id },
      data: { ...dto, condition: dto.condition as Prisma.InputJsonValue | undefined },
    });
  }

  async deleteAchievement(id: string) {
    await this.requireAchievement(id);
    await this.prisma.achievement.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireAchievement(id: string): Promise<void> {
    const found = await this.prisma.achievement.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Achievement not found');
    }
  }
}
