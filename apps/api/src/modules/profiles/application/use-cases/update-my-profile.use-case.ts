import { Injectable, NotFoundException } from '@nestjs/common';
import { type Theme } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface UpdateMyProfileCommand {
  userId: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  theme?: Theme;
  nativeLanguage?: string;
  learningLanguage?: string;
}

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, ...patch }: UpdateMyProfileCommand) {
    const existing = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }
    return this.prisma.userProfile.update({
      where: { userId },
      data: patch,
    });
  }
}
