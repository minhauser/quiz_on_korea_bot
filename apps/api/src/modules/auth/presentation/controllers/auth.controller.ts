import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';

import {
  type AuthenticatedUser,
  CurrentUser,
} from '../../../../shared/presentation/decorators/current-user.decorator';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { MeResponseDto, RegisterResponseDto, TokensResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { RegisterDto } from '../dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiOkResponse({ type: RegisterResponseDto })
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive an access/refresh token pair' })
  @ApiOkResponse({ type: TokensResponseDto })
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<TokensResponseDto> {
    return this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
      userAgent: req.headers['user-agent'] ?? null,
      ip: req.ip ?? null,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  @ApiOkResponse({ type: TokensResponseDto })
  refresh(@Body() dto: RefreshDto, @Req() req: Request): Promise<TokensResponseDto> {
    return this.refreshUseCase.execute({
      refreshToken: dto.refreshToken,
      userAgent: req.headers['user-agent'] ?? null,
      ip: req.ip ?? null,
    });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the refresh-token family (logout)' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.logoutUseCase.execute({ refreshToken: dto.refreshToken });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the currently authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): MeResponseDto {
    return { sub: user.sub, email: user.email, role: user.role };
  }
}
