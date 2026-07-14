import { Module } from '@nestjs/common';

import { ListAchievementsUseCase } from './application/use-cases/list-achievements.use-case';
import { AchievementsController } from './presentation/controllers/achievements.controller';

@Module({
  controllers: [AchievementsController],
  providers: [ListAchievementsUseCase],
})
export class AchievementsModule {}
