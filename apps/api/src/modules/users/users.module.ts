import { Module } from '@nestjs/common';

import { PASSWORD_HASHER } from '../auth/application/ports/password-hasher.port';
import { Argon2PasswordHasher } from '../auth/infrastructure/services/argon2-password-hasher';

import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { DeactivateAccountUseCase } from './application/use-cases/deactivate-account.use-case';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    ChangePasswordUseCase,
    DeactivateAccountUseCase,
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
  ],
})
export class UsersModule {}
