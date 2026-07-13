import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { TOKEN_SERVICE } from './application/ports/token-service.port';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/repositories/prisma-refresh-token.repository';
import { PrismaUserRepository } from './infrastructure/persistence/repositories/prisma-user.repository';
import { Argon2PasswordHasher } from './infrastructure/services/argon2-password-hasher';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [PassportModule, ConfigModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    JwtStrategy,
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
  ],
})
export class AuthModule {}
