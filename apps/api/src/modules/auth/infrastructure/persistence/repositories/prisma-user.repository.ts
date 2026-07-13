import { Injectable } from '@nestjs/common';
import { type User as PrismaUser } from '@prisma/client';

import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import {
  type CreateUserData,
  type UserRecord,
  type UserRepository,
} from '../../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findFirst({ where: { email, deletedAt: null } });
    return user ? PrismaUserRepository.toRecord(user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    return user ? PrismaUserRepository.toRecord(user) : null;
  }

  async createWithProfile(data: CreateUserData): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        provider: 'EMAIL',
        profile: {
          create: {
            nickname: data.nickname,
            nativeLanguage: data.nativeLanguage,
          },
        },
      },
    });
    return PrismaUserRepository.toRecord(user);
  }

  private static toRecord(user: PrismaUser): UserRecord {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      provider: user.provider,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    };
  }
}
