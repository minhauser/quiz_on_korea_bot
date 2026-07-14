import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListDailyMissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const today = startOfDay(new Date());

    const missions = await this.prisma.mission.findMany({
      where: { deletedAt: null, period: 'DAILY' },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-assign today's row for any mission the user hasn't touched yet, so
    // the list always shows a 0/goal entry instead of omitting it.
    await this.prisma.$transaction(
      missions.map((m) =>
        this.prisma.userMission.upsert({
          where: { userId_missionId_assignedOn: { userId, missionId: m.id, assignedOn: today } },
          create: { userId, missionId: m.id, assignedOn: today, progress: 0 },
          update: {},
        }),
      ),
    );

    const userMissions = await this.prisma.userMission.findMany({
      where: { userId, assignedOn: today },
    });
    const byMissionId = new Map(userMissions.map((um) => [um.missionId, um]));

    return missions.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      goal: m.goal,
      rewardXp: m.rewardXp,
      rewardCoins: m.rewardCoins,
      progress: byMissionId.get(m.id)?.progress ?? 0,
      completed: byMissionId.get(m.id)?.completed ?? false,
    }));
  }
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
