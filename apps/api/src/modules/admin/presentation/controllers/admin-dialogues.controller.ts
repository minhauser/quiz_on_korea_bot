import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminDialoguesService } from '../../application/services/admin-dialogues.service';
import { CreateDialogueDto, UpdateDialogueDto } from '../dto/admin-dialogues.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/dialogues')
export class AdminDialoguesController {
  constructor(
    private readonly service: AdminDialoguesService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a dialogue (optionally with lines)' })
  async create(@Body() dto: CreateDialogueDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const dialogue = await this.service.createDialogue(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Dialogue', entityId: dialogue.id, ip: req.ip });
    return dialogue;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dialogue' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDialogueDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const dialogue = await this.service.updateDialogue(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Dialogue', entityId: id, ip: req.ip });
    return dialogue;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a dialogue' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteDialogue(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Dialogue', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
