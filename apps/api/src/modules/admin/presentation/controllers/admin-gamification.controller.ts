import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminGamificationService } from '../../application/services/admin-gamification.service';
import { CreateMissionDto, CreateRewardDto, UpdateMissionDto, UpdateRewardDto } from '../dto/admin-gamification.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminGamificationController {
  constructor(
    private readonly service: AdminGamificationService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post('missions')
  @ApiOperation({ summary: 'Create a mission (daily/weekly/monthly)' })
  async createMission(@Body() dto: CreateMissionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const mission = await this.service.createMission(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Mission', entityId: mission.id, ip: req.ip });
    return mission;
  }

  @Patch('missions/:id')
  @ApiOperation({ summary: 'Update a mission' })
  async updateMission(
    @Param('id') id: string,
    @Body() dto: UpdateMissionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const mission = await this.service.updateMission(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Mission', entityId: id, ip: req.ip });
    return mission;
  }

  @Delete('missions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a mission' })
  async removeMission(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteMission(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Mission', entityId: id, ip: req.ip });
    return { deleted: true };
  }

  @Post('rewards')
  @ApiOperation({ summary: 'Create a shop reward' })
  async createReward(@Body() dto: CreateRewardDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const reward = await this.service.createReward(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Reward', entityId: reward.id, ip: req.ip });
    return reward;
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Update a shop reward' })
  async updateReward(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const reward = await this.service.updateReward(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Reward', entityId: id, ip: req.ip });
    return reward;
  }

  @Delete('rewards/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a shop reward' })
  async removeReward(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteReward(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Reward', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
