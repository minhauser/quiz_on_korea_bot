import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PasswordHasher } from '../../application/ports/password-hasher.port';
import { type TokenService } from '../../application/ports/token-service.port';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AccountNotActiveError, InvalidCredentialsError } from '../../domain/errors/auth.errors';
import { type RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { type UserRecord, type UserRepository } from '../../domain/repositories/user.repository';

const activeUser: UserRecord = {
  id: 'u1',
  email: 'a@b.com',
  passwordHash: 'hash',
  provider: 'EMAIL',
  role: 'STUDENT',
  status: 'ACTIVE',
  emailVerified: true,
};

function build(opts: { user?: UserRecord | null; verify?: boolean }): LoginUseCase {
  const users = {
    findByEmail: vi.fn().mockResolvedValue(opts.user === undefined ? activeUser : opts.user),
    findById: vi.fn(),
    createWithProfile: vi.fn(),
  } as unknown as UserRepository;

  const refreshTokens = {
    create: vi.fn().mockResolvedValue({ id: 'rt1' }),
    findByHash: vi.fn(),
    markRevoked: vi.fn(),
    revokeFamily: vi.fn(),
  } as unknown as RefreshTokenRepository;

  const hasher = {
    hash: vi.fn(),
    verify: vi.fn().mockResolvedValue(opts.verify ?? true),
  } as unknown as PasswordHasher;

  const tokens = {
    issueAccessToken: vi.fn().mockResolvedValue('access'),
    generateRefreshToken: vi.fn().mockReturnValue('refresh-raw'),
    hashRefreshToken: vi.fn().mockReturnValue('refresh-hash'),
    refreshExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 10_000)),
  } as unknown as TokenService;

  return new LoginUseCase(users, refreshTokens, hasher, tokens);
}

describe('LoginUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns tokens for valid credentials', async () => {
    const result = await build({}).execute({ email: 'A@B.com', password: 'password123' });
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh-raw' });
  });

  it('rejects an unknown user', async () => {
    await expect(
      build({ user: null }).execute({ email: 'a@b.com', password: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rejects a wrong password', async () => {
    await expect(
      build({ verify: false }).execute({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rejects a non-active account', async () => {
    const suspended: UserRecord = { ...activeUser, status: 'SUSPENDED' };
    await expect(
      build({ user: suspended }).execute({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(AccountNotActiveError);
  });
});
