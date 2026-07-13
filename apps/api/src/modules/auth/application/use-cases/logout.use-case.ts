import { Inject, Injectable } from '@nestjs/common';

import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';
import { TOKEN_SERVICE, type TokenService } from '../ports/token-service.port';

export interface LogoutCommand {
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  /** Revokes the whole token family, ending the session on every device it spawned. Idempotent. */
  async execute(command: LogoutCommand): Promise<void> {
    const stored = await this.refreshTokens.findByHash(
      this.tokens.hashRefreshToken(command.refreshToken),
    );
    if (stored && !stored.revokedAt) {
      await this.refreshTokens.revokeFamily(stored.familyId);
    }
  }
}
