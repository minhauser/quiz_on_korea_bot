import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { ListAchievementsUseCase } from '../../application/use-cases/list-achievements.use-case';

@ApiTags('achievements')
@ApiBearerAuth()
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly listAchievements: ListAchievementsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List achievements with this user’s unlock state (hidden ones only shown once earned)' })
  list(@CurrentUser('sub') userId: string) {
    return this.listAchievements.execute(userId);
  }
}
