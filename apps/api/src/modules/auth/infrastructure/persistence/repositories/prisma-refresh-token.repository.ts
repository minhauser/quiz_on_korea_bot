import { Injectable } from '@nestjs/common';
import { type RefreshToken as PrismaRefreshToken } from '@prisma/client';

import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import {
  type CreateRefreshTokenData,
  type RefreshTokenRecord,
  type RefreshTokenRepository,
} from '../../../domain/repositories/refresh-token.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshTokenRecord> {
    const token = await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        familyId: data.familyId,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent ?? null,
        ip: data.ip ?? null,
      },
    });
    return PrismaRefreshTokenRepository.toRecord(token);
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    return token ? PrismaRefreshTokenRepository.toRecord(token) : null;
  }

  async markRevoked(id: string, replacedByTokenId?: string | null): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedByTokenId: replacedByTokenId ?? null },
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private static toRecord(token: PrismaRefreshToken): RefreshTokenRecord {
    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      familyId: token.familyId,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
      replacedByTokenId: token.replacedByTokenId,
    };
  }
}
