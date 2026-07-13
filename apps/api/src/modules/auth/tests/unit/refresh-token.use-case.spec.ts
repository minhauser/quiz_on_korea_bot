import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type TokenService } from '../../application/ports/token-service.port';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { InvalidRefreshTokenError } from '../../domain/errors/auth.errors';
import {
  type RefreshTokenRecord,
  type RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';
import { type UserRepository } from '../../domain/repositories/user.repository';

const validStored: RefreshTokenRecord = {
  id: 'rt1',
  userId: 'u1',
  tokenHash: 'hash',
  familyId: 'fam1',
  expiresAt: new Date(Date.now() + 100_000),
  revokedAt: null,
  replacedByTokenId: null,
};

function build(stored: RefreshTokenRecord | null) {
  const users = {
    findById: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'STUDENT' }),
    findByEmail: vi.fn(),
    createWithProfile: vi.fn(),
  } as unknown as UserRepository;

  const refreshTokens = {
    findByHash: vi.fn().mockResolvedValue(stored),
    create: vi.fn().mockResolvedValue({ id: 'new-rt' }),
    markRevoked: vi.fn(),
    revokeFamily: vi.fn(),
  } as unknown as RefreshTokenRepository;

  const tokens = {
    issueAccessToken: vi.fn().mockResolvedValue('access'),
    generateRefreshToken: vi.fn().mockReturnValue('new-raw'),
    hashRefreshToken: vi.fn().mockReturnValue('hash'),
    refreshExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 100_000)),
  } as unknown as TokenService;

  return { useCase: new RefreshTokenUseCase(users, refreshTokens, tokens), refreshTokens };
}

describe('RefreshTokenUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rotates a valid refresh token, preserving the family', async () => {
    const { useCase, refreshTokens } = build(validStored);
    const result = await useCase.execute({ refreshToken: 'raw' });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('new-raw');
    expect(refreshTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ familyId: 'fam1' }),
    );
    expect(refreshTokens.markRevoked).toHaveBeenCalledWith('rt1', 'new-rt');
  });

  it('detects reuse of a revoked token and revokes the whole family', async () => {
    const { useCase, refreshTokens } = build({ ...validStored, revokedAt: new Date() });
    await expect(useCase.execute({ refreshToken: 'raw' })).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
    expect(refreshTokens.revokeFamily).toHaveBeenCalledWith('fam1');
  });

  it('rejects an unknown token', async () => {
    const { useCase } = build(null);
    await expect(useCase.execute({ refreshToken: 'raw' })).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('rejects an expired token', async () => {
    const { useCase } = build({ ...validStored, expiresAt: new Date(Date.now() - 1_000) });
    await expect(useCase.execute({ refreshToken: 'raw' })).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });
});
