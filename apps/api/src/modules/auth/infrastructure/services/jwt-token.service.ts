import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  type AccessTokenPayload,
  type TokenService,
} from '../../application/ports/token-service.port';

const DURATION_MULTIPLIERS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

type DurationUnit = keyof typeof DURATION_MULTIPLIERS;

function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    return 0;
  }
  const amount = Number(match[1]);
  const unit = match[2] as DurationUnit;
  return amount * DURATION_MULTIPLIERS[unit];
}

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  issueAccessToken(payload: AccessTokenPayload): Promise<string> {
    // jsonwebtoken accepts a number of seconds (avoids the ms.StringValue type).
    const expiresInSeconds = Math.floor(
      parseDurationMs(this.config.getOrThrow<string>('jwt.accessTtl')) / 1000,
    );
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: expiresInSeconds,
    });
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  refreshExpiry(): Date {
    const ttl = this.config.getOrThrow<string>('jwt.refreshTtl');
    return new Date(Date.now() + parseDurationMs(ttl));
  }
}
