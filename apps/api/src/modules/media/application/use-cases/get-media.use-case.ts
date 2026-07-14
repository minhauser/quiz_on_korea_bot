import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const media = await this.prisma.mediaLibrary.findFirst({ where: { id, deletedAt: null } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }
}
