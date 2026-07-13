import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListUniversitiesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute() {
    return this.prisma.university.findMany({
      where: { deletedAt: null },
      include: { faculties: { where: { deletedAt: null } } },
      orderBy: { nameEn: 'asc' },
    });
  }
}
