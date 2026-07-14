import { Module } from '@nestjs/common';

import { AchievementCheckerService } from './achievement-checker.service';
import { MissionProgressService } from './mission-progress.service';
import { XpRewardService } from './xp-reward.service';

@Module({
  providers: [XpRewardService, AchievementCheckerService, MissionProgressService],
  exports: [XpRewardService, AchievementCheckerService, MissionProgressService],
})
export class GameplayModule {}
