import { Module } from '@nestjs/common';

import { GetLeaderboardUseCase } from './application/use-cases/get-leaderboard.use-case';
import { GetMyStatsUseCase } from './application/use-cases/get-my-stats.use-case';
import { StatisticsController } from './presentation/controllers/statistics.controller';

@Module({
  controllers: [StatisticsController],
  providers: [GetMyStatsUseCase, GetLeaderboardUseCase],
})
export class StatisticsModule {}
