import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminQuizzesService } from '../../application/services/admin-quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from '../dto/admin-quizzes.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/quizzes')
export class AdminQuizzesController {
  constructor(
    private readonly service: AdminQuizzesService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a quiz template (optionally with questions and answer options)' })
  async create(@Body() dto: CreateQuizDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const quiz = await this.service.createQuiz(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'QuizTemplate', entityId: quiz.id, ip: req.ip });
    return quiz;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz template' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const quiz = await this.service.updateQuiz(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'QuizTemplate', entityId: id, ip: req.ip });
    return quiz;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a quiz template' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteQuiz(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'QuizTemplate', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
