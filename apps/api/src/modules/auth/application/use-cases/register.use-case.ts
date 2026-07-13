import { Inject, Injectable } from '@nestjs/common';

import { EmailAlreadyInUseError, WeakPasswordError } from '../../domain/errors/auth.errors';
import { USER_REPOSITORY, type UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { PASSWORD_HASHER, type PasswordHasher } from '../ports/password-hasher.port';

const MIN_PASSWORD_LENGTH = 8;

export interface RegisterCommand {
  email: string;
  password: string;
  nickname: string;
  nativeLanguage: string;
}

export interface RegisterResult {
  id: string;
  email: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const email = Email.create(command.email);

    if (command.password.length < MIN_PASSWORD_LENGTH) {
      throw new WeakPasswordError();
    }

    const existing = await this.users.findByEmail(email.value);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await this.hasher.hash(command.password);
    const user = await this.users.createWithProfile({
      email: email.value,
      passwordHash,
      nickname: command.nickname,
      nativeLanguage: command.nativeLanguage,
    });

    return { id: user.id, email: user.email };
  }
}
