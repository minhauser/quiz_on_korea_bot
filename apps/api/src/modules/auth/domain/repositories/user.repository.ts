import { type AuthProvider, type Role, type UserStatus } from '@prisma/client';

/** Minimal user view the Auth module needs. The Users module (Sprint 2) owns the richer aggregate. */
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string | null;
  provider: AuthProvider;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  nickname: string;
  nativeLanguage: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  createWithProfile(data: CreateUserData): Promise<UserRecord>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
