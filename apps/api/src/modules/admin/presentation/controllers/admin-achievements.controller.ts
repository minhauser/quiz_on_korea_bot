import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAchievementsService } from '../../application/services/admin-achievements.service';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { CreateAchievementDto, UpdateAchievementDto } from '../dto/admin-achievements.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/achievements')
export class AdminAchievementsController {
  constructor(
    private readonly service: AdminAchievementsService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an achievement definition' })
  async create(@Body() dto: CreateAchievementDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const achievement = await this.service.createAchievement(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Achievement', entityId: achievement.id, ip: req.ip });
    return achievement;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an achievement definition' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const achievement = await this.service.updateAchievement(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Achievement', entityId: id, ip: req.ip });
    return achievement;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an achievement definition' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteAchievement(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Achievement', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
