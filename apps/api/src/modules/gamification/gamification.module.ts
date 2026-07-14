import { Module } from '@nestjs/common';

import { EquipRewardUseCase } from './application/use-cases/equip-reward.use-case';
import { ListDailyMissionsUseCase } from './application/use-cases/list-daily-missions.use-case';
import { ListInventoryUseCase } from './application/use-cases/list-inventory.use-case';
import { ListRewardsUseCase } from './application/use-cases/list-rewards.use-case';
import { PurchaseRewardUseCase } from './application/use-cases/purchase-reward.use-case';
import { GamificationController } from './presentation/controllers/gamification.controller';

@Module({
  controllers: [GamificationController],
  providers: [
    ListDailyMissionsUseCase,
    ListRewardsUseCase,
    ListInventoryUseCase,
    PurchaseRewardUseCase,
    EquipRewardUseCase,
  ],
})
export class GamificationModule {}
