import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetMyProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true, role: true, provider: true, createdAt: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
