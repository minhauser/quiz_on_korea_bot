import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { EquipRewardUseCase } from '../../application/use-cases/equip-reward.use-case';
import { ListDailyMissionsUseCase } from '../../application/use-cases/list-daily-missions.use-case';
import { ListInventoryUseCase } from '../../application/use-cases/list-inventory.use-case';
import { ListRewardsUseCase } from '../../application/use-cases/list-rewards.use-case';
import { PurchaseRewardUseCase } from '../../application/use-cases/purchase-reward.use-case';

@ApiTags('gamification')
@ApiBearerAuth()
@Controller()
export class GamificationController {
  constructor(
    private readonly listDailyMissions: ListDailyMissionsUseCase,
    private readonly listRewards: ListRewardsUseCase,
    private readonly listInventory: ListInventoryUseCase,
    private readonly purchaseReward: PurchaseRewardUseCase,
    private readonly equipReward: EquipRewardUseCase,
  ) {}

  @Get('missions/daily')
  @ApiOperation({ summary: 'List today’s daily missions with progress (auto-assigns on first fetch)' })
  dailyMissions(@CurrentUser('sub') userId: string) {
    return this.listDailyMissions.execute(userId);
  }

  @Get('gamification/rewards')
  @ApiOperation({ summary: 'List the reward catalog with cost/ownership state for this user' })
  rewards(@CurrentUser('sub') userId: string) {
    return this.listRewards.execute(userId);
  }

  @Get('gamification/inventory')
  @ApiOperation({ summary: 'List this user’s owned rewards' })
  inventory(@CurrentUser('sub') userId: string) {
    return this.listInventory.execute(userId);
  }

  @Post('gamification/rewards/:id/purchase')
  @ApiOperation({ summary: 'Purchase a reward from the catalog using coins' })
  purchase(@Param('id') rewardId: string, @CurrentUser('sub') userId: string) {
    return this.purchaseReward.execute(userId, rewardId);
  }

  @Post('gamification/inventory/:id/equip')
  @ApiOperation({ summary: 'Equip an owned reward (unequips any other item of the same type)' })
  equip(@Param('id') rewardId: string, @CurrentUser('sub') userId: string) {
    return this.equipReward.execute(userId, rewardId);
  }
}
