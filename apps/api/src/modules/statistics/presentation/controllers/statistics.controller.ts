import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { GetLeaderboardUseCase } from '../../application/use-cases/get-leaderboard.use-case';
import { GetMyStatsUseCase } from '../../application/use-cases/get-my-stats.use-case';

@ApiTags('statistics')
@ApiBearerAuth()
@Controller('stats')
export class StatisticsController {
  constructor(
    private readonly getMyStats: GetMyStatsUseCase,
    private readonly getLeaderboard: GetLeaderboardUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get this user’s aggregate stats, activity heatmap, and category mastery' })
  me(@CurrentUser('sub') userId: string) {
    return this.getMyStats.execute(userId);
  }

  @Get('leaderboard')
  @ApiQuery({ name: 'period', enum: ['alltime', 'weekly'], required: false })
  @ApiOperation({ summary: 'Get the top-XP leaderboard (Redis-backed, real-time)' })
  leaderboard(@CurrentUser('sub') userId: string, @Query('period') period?: 'alltime' | 'weekly') {
    return this.getLeaderboard.execute(userId, period === 'weekly' ? 'weekly' : 'alltime');
  }
}
