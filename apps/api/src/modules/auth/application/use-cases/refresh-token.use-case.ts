import { Inject, Injectable } from '@nestjs/common';

import { InvalidRefreshTokenError } from '../../domain/errors/auth.errors';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';
import { USER_REPOSITORY, type UserRepository } from '../../domain/repositories/user.repository';
import { TOKEN_SERVICE, type TokenService } from '../ports/token-service.port';

import { type AuthTokens } from './login.use-case';

export interface RefreshCommand {
  refreshToken: string;
  userAgent?: string | null;
  ip?: string | null;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(command: RefreshCommand): Promise<AuthTokens> {
    const stored = await this.refreshTokens.findByHash(
      this.tokens.hashRefreshToken(command.refreshToken),
    );

    if (!stored) {
      throw new InvalidRefreshTokenError();
    }

    // Reuse detection: a revoked token being replayed means the family is
    // compromised — revoke the entire family and reject.
    if (stored.revokedAt) {
      await this.refreshTokens.revokeFamily(stored.familyId);
      throw new InvalidRefreshTokenError();
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.users.findById(stored.userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    // Rotate: mint a new refresh token in the same family, then revoke the old
    // one pointing at its replacement (audit trail + reuse detection).
    const accessToken = await this.tokens.issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = this.tokens.generateRefreshToken();
    const created = await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.tokens.hashRefreshToken(newRefreshToken),
      familyId: stored.familyId,
      expiresAt: this.tokens.refreshExpiry(),
      userAgent: command.userAgent,
      ip: command.ip,
    });
    await this.refreshTokens.markRevoked(stored.id, created.id);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
