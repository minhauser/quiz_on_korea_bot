import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  type CreateMissionDto,
  type CreateRewardDto,
  type UpdateMissionDto,
  type UpdateRewardDto,
} from '../../presentation/dto/admin-gamification.dto';

@Injectable()
export class AdminGamificationService {
  constructor(private readonly prisma: PrismaService) {}

  createMission(dto: CreateMissionDto) {
    return this.prisma.mission.create({ data: dto });
  }

  async updateMission(id: string, dto: UpdateMissionDto) {
    await this.requireMission(id);
    return this.prisma.mission.update({ where: { id }, data: dto });
  }

  async deleteMission(id: string) {
    await this.requireMission(id);
    await this.prisma.mission.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  createReward(dto: CreateRewardDto) {
    return this.prisma.reward.create({ data: dto });
  }

  async updateReward(id: string, dto: UpdateRewardDto) {
    await this.requireReward(id);
    return this.prisma.reward.update({ where: { id }, data: dto });
  }

  async deleteReward(id: string) {
    await this.requireReward(id);
    await this.prisma.reward.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireMission(id: string): Promise<void> {
    const found = await this.prisma.mission.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Mission not found');
    }
  }

  private async requireReward(id: string): Promise<void> {
    const found = await this.prisma.reward.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Reward not found');
    }
  }
}
