import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { type AuthProvider, UserStatus } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { AccountNotActiveError } from '../../domain/errors/auth.errors';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';
import { TOKEN_SERVICE, type TokenService } from '../ports/token-service.port';

import { type AuthTokens } from './login.use-case';

export interface OAuthLoginCommand {
  provider: AuthProvider;
  email: string;
  nickname: string;
  avatar: string | null;
  userAgent?: string | null;
  ip?: string | null;
}

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(command: OAuthLoginCommand): Promise<AuthTokens> {
    const email = command.email.trim().toLowerCase();
    const user = await this.findOrCreate(command, email);

    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountNotActiveError();
    }

    const accessToken = await this.tokens.issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = this.tokens.generateRefreshToken();

    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.tokens.hashRefreshToken(refreshToken),
      familyId: randomUUID(),
      expiresAt: this.tokens.refreshExpiry(),
      userAgent: command.userAgent,
      ip: command.ip,
    });

    return { accessToken, refreshToken };
  }

  private async findOrCreate(command: OAuthLoginCommand, email: string) {
    const existing = await this.prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existing) {
      return existing;
    }
    return this.prisma.user.create({
      data: {
        email,
        provider: command.provider,
        emailVerified: true,
        profile: {
          create: {
            nickname: command.nickname,
            nativeLanguage: 'en',
            avatar: command.avatar ?? undefined,
          },
        },
      },
    });
  }
}
