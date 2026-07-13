import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PasswordHasher } from '../../application/ports/password-hasher.port';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import {
  EmailAlreadyInUseError,
  InvalidEmailError,
  WeakPasswordError,
} from '../../domain/errors/auth.errors';
import { type UserRepository } from '../../domain/repositories/user.repository';

function makeUsers(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
    createWithProfile: vi.fn().mockImplementation((data: { email: string; passwordHash: string }) =>
      Promise.resolve({
        id: 'user-1',
        email: data.email,
        passwordHash: data.passwordHash,
        provider: 'EMAIL',
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: false,
      }),
    ),
    ...overrides,
  };
}

const hasher: PasswordHasher = {
  hash: vi.fn().mockResolvedValue('hashed'),
  verify: vi.fn().mockResolvedValue(true),
};

describe('RegisterUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers a new user with a normalized email', async () => {
    const users = makeUsers();
    const useCase = new RegisterUseCase(users, hasher);

    const result = await useCase.execute({
      email: 'New@Example.com',
      password: 'password123',
      nickname: 'minji',
      nativeLanguage: 'en',
    });

    expect(result).toEqual({ id: 'user-1', email: 'new@example.com' });
    expect(hasher.hash).toHaveBeenCalledWith('password123');
    expect(users.createWithProfile).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com', passwordHash: 'hashed' }),
    );
  });

  it('rejects an invalid email', async () => {
    const useCase = new RegisterUseCase(makeUsers(), hasher);
    await expect(
      useCase.execute({
        email: 'not-an-email',
        password: 'password123',
        nickname: 'x',
        nativeLanguage: 'en',
      }),
    ).rejects.toBeInstanceOf(InvalidEmailError);
  });

  it('rejects a weak password', async () => {
    const useCase = new RegisterUseCase(makeUsers(), hasher);
    await expect(
      useCase.execute({ email: 'a@b.com', password: 'short', nickname: 'x', nativeLanguage: 'en' }),
    ).rejects.toBeInstanceOf(WeakPasswordError);
  });

  it('rejects a duplicate email', async () => {
    const users = makeUsers({
      findByEmail: vi.fn().mockResolvedValue({ id: 'existing' }),
    });
    const useCase = new RegisterUseCase(users, hasher);
    await expect(
      useCase.execute({
        email: 'a@b.com',
        password: 'password123',
        nickname: 'x',
        nativeLanguage: 'en',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});
