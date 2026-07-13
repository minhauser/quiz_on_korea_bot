import { Module } from '@nestjs/common';

import { XpRewardService } from './xp-reward.service';

@Module({
  providers: [XpRewardService],
  exports: [XpRewardService],
})
export class GameplayModule {}
