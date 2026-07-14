import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface DeleteMediaCommand {
  id: string;
  requestedById: string;
  requestedByRole: Role;
}

@Injectable()
export class DeleteMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, requestedById, requestedByRole }: DeleteMediaCommand): Promise<void> {
    const media = await this.prisma.mediaLibrary.findFirst({ where: { id, deletedAt: null } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    const isOwner = media.uploadedById === requestedById;
    const isAdmin = requestedByRole === Role.ADMIN || requestedByRole === Role.SUPER_ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not allowed to delete this media asset');
    }
    await this.prisma.mediaLibrary.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
