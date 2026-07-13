import { type Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface TokenService {
  /** Signs a short-lived JWT access token. */
  issueAccessToken(payload: AccessTokenPayload): Promise<string>;
  /** Generates an opaque (non-JWT) refresh token — random, revocable. */
  generateRefreshToken(): string;
  /** SHA-256 hash used for storage and lookup (raw token is never persisted). */
  hashRefreshToken(token: string): string;
  /** Absolute expiry for a newly issued refresh token. */
  refreshExpiry(): Date;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
