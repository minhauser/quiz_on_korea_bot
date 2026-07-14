import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminVocabularyService } from '../../application/services/admin-vocabulary.service';
import { CreateVocabularyDto, UpdateVocabularyDto } from '../dto/admin-vocabulary.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/vocabulary')
export class AdminVocabularyController {
  constructor(
    private readonly service: AdminVocabularyService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a vocabulary item (optionally with example sentences)' })
  async create(@Body() dto: CreateVocabularyDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const word = await this.service.createVocabulary(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Vocabulary', entityId: word.id, ip: req.ip });
    return word;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vocabulary item' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVocabularyDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const word = await this.service.updateVocabulary(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Vocabulary', entityId: id, ip: req.ip });
    return word;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a vocabulary item' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteVocabulary(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Vocabulary', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
