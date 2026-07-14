import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminGrammarService } from '../../application/services/admin-grammar.service';
import { CreateGrammarDto, UpdateGrammarDto } from '../dto/admin-grammar.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/grammar')
export class AdminGrammarController {
  constructor(
    private readonly service: AdminGrammarService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a grammar pattern (optionally with examples)' })
  async create(@Body() dto: CreateGrammarDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const grammar = await this.service.createGrammar(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Grammar', entityId: grammar.id, ip: req.ip });
    return grammar;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grammar pattern' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGrammarDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const grammar = await this.service.updateGrammar(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Grammar', entityId: id, ip: req.ip });
    return grammar;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a grammar pattern' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteGrammar(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Grammar', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
