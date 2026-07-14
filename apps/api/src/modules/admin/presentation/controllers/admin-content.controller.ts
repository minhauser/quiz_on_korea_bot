import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { type Request } from 'express';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { AdminAuditService } from '../../application/services/admin-audit.service';
import { AdminContentService } from '../../application/services/admin-content.service';
import {
  CreateCategoryDto,
  CreateFacultyDto,
  CreateUniversityDto,
  UpdateCategoryDto,
  UpdateFacultyDto,
  UpdateUniversityDto,
} from '../dto/admin-content.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/content')
export class AdminContentController {
  constructor(
    private readonly service: AdminContentService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post('categories')
  @ApiOperation({ summary: 'Create a vocabulary category (world/chapter)' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const category = await this.service.createCategory(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'VocabularyCategory', entityId: category.id, ip: req.ip });
    return category;
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a vocabulary category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const category = await this.service.updateCategory(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'VocabularyCategory', entityId: id, ip: req.ip });
    return category;
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a vocabulary category' })
  async deleteCategory(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteCategory(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'VocabularyCategory', entityId: id, ip: req.ip });
    return { deleted: true };
  }

  @Post('universities')
  @ApiOperation({ summary: 'Create a university' })
  async createUniversity(
    @Body() dto: CreateUniversityDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const university = await this.service.createUniversity(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'University', entityId: university.id, ip: req.ip });
    return university;
  }

  @Patch('universities/:id')
  @ApiOperation({ summary: 'Update a university' })
  async updateUniversity(
    @Param('id') id: string,
    @Body() dto: UpdateUniversityDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const university = await this.service.updateUniversity(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'University', entityId: id, ip: req.ip });
    return university;
  }

  @Delete('universities/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a university' })
  async deleteUniversity(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteUniversity(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'University', entityId: id, ip: req.ip });
    return { deleted: true };
  }

  @Post('faculties')
  @ApiOperation({ summary: 'Create a faculty under a university' })
  async createFaculty(
    @Body() dto: CreateFacultyDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const faculty = await this.service.createFaculty(dto);
    await this.audit.log({ adminId: user.sub, action: 'create', entity: 'Faculty', entityId: faculty.id, ip: req.ip });
    return faculty;
  }

  @Patch('faculties/:id')
  @ApiOperation({ summary: 'Update a faculty' })
  async updateFaculty(
    @Param('id') id: string,
    @Body() dto: UpdateFacultyDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const faculty = await this.service.updateFaculty(id, dto);
    await this.audit.log({ adminId: user.sub, action: 'update', entity: 'Faculty', entityId: id, ip: req.ip });
    return faculty;
  }

  @Delete('faculties/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a faculty' })
  async deleteFaculty(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.service.deleteFaculty(id);
    await this.audit.log({ adminId: user.sub, action: 'delete', entity: 'Faculty', entityId: id, ip: req.ip });
    return { deleted: true };
  }
}
