import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../../auth/application/ports/password-hasher.port';

export interface ChangePasswordCommand {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute({ userId, currentPassword, newPassword }: ChangePasswordCommand): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.passwordHash) {
      throw new BadRequestException('This account has no password set (OAuth login only)');
    }
    const valid = await this.hasher.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await this.hasher.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }
}
