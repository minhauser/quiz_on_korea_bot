import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { type Role, UserStatus } from '@prisma/client';

import { AccountNotActiveError, InvalidCredentialsError } from '../../domain/errors/auth.errors';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';
import { USER_REPOSITORY, type UserRepository } from '../../domain/repositories/user.repository';
import { PASSWORD_HASHER, type PasswordHasher } from '../ports/password-hasher.port';
import { TOKEN_SERVICE, type TokenService } from '../ports/token-service.port';

export interface LoginCommand {
  email: string;
  password: string;
  userAgent?: string | null;
  ip?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokens> {
    const user = await this.users.findByEmail(command.email.trim().toLowerCase());

    // Same error for "no user" and "bad password" to avoid account enumeration.
    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    const valid = await this.hasher.verify(user.passwordHash, command.password);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountNotActiveError();
    }

    return this.issueTokens(user.id, user.email, user.role, command.userAgent, command.ip);
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: Role,
    userAgent?: string | null,
    ip?: string | null,
  ): Promise<AuthTokens> {
    const accessToken = await this.tokens.issueAccessToken({ sub: userId, email, role });
    const refreshToken = this.tokens.generateRefreshToken();

    await this.refreshTokens.create({
      userId,
      tokenHash: this.tokens.hashRefreshToken(refreshToken),
      familyId: randomUUID(),
      expiresAt: this.tokens.refreshExpiry(),
      userAgent,
      ip,
    });

    return { accessToken, refreshToken };
  }
}
