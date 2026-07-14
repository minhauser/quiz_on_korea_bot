import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminLearningService } from '../../application/services/admin-learning.service';
import { CreateLessonDto, UpdateLessonDto } from '../dto/admin-learning.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/lessons')
export class AdminLearningController {
  constructor(
    private readonly service: AdminLearningService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a lesson' })
  async create(@Body() dto: CreateLessonDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const lesson = await this.service.createLesson(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Lesson', entityId: lesson.id, ip: req.ip });
    return lesson;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const lesson = await this.service.updateLesson(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Lesson', entityId: id, ip: req.ip });
    return lesson;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a lesson' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteLesson(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Lesson', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
