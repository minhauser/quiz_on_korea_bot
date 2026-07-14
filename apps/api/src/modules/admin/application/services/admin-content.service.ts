import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  type CreateCategoryDto,
  type CreateFacultyDto,
  type CreateUniversityDto,
  type UpdateCategoryDto,
  type UpdateFacultyDto,
  type UpdateUniversityDto,
} from '../../presentation/dto/admin-content.dto';

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService) {}

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.vocabularyCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.requireCategory(id);
    return this.prisma.vocabularyCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    await this.requireCategory(id);
    await this.prisma.vocabularyCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  createUniversity(dto: CreateUniversityDto) {
    return this.prisma.university.create({ data: dto });
  }

  async updateUniversity(id: string, dto: UpdateUniversityDto) {
    await this.requireUniversity(id);
    return this.prisma.university.update({ where: { id }, data: dto });
  }

  async deleteUniversity(id: string) {
    await this.requireUniversity(id);
    await this.prisma.university.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  createFaculty(dto: CreateFacultyDto) {
    return this.prisma.faculty.create({ data: dto });
  }

  async updateFaculty(id: string, dto: UpdateFacultyDto) {
    await this.requireFaculty(id);
    return this.prisma.faculty.update({ where: { id }, data: dto });
  }

  async deleteFaculty(id: string) {
    await this.requireFaculty(id);
    await this.prisma.faculty.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async requireCategory(id: string): Promise<void> {
    const found = await this.prisma.vocabularyCategory.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Category not found');
    }
  }

  private async requireUniversity(id: string): Promise<void> {
    const found = await this.prisma.university.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('University not found');
    }
  }

  private async requireFaculty(id: string): Promise<void> {
    const found = await this.prisma.faculty.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new NotFoundException('Faculty not found');
    }
  }
}
