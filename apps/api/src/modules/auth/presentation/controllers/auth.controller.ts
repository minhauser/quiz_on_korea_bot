import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type AuthProvider } from '@prisma/client';
import { type Request, type Response } from 'express';

import {
  type AuthenticatedUser,
  CurrentUser,
} from '../../../../shared/presentation/decorators/current-user.decorator';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { OAuthLoginUseCase } from '../../application/use-cases/oauth-login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { type OAuthProfile } from '../../infrastructure/strategies/google.strategy';
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
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
    private readonly config: ConfigService,
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

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google for OAuth login' })
  googleLogin(): void {
    // Passport's AuthGuard performs the redirect; this body never runs.
  }

  @Public()
  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback — issues tokens and redirects to the frontend' })
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.completeOAuthLogin('GOOGLE', req, res);
  }

  @Public()
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Redirect to Kakao for OAuth login' })
  kakaoLogin(): void {
    // Passport's AuthGuard performs the redirect; this body never runs.
  }

  @Public()
  @Get('callback/kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth callback — issues tokens and redirects to the frontend' })
  async kakaoCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.completeOAuthLogin('KAKAO', req, res);
  }

  private async completeOAuthLogin(
    provider: AuthProvider,
    req: Request,
    res: Response,
  ): Promise<void> {
    const profile = req.user as OAuthProfile;
    const frontendUrl = this.config.get<string>('app.corsOrigin') ?? 'http://localhost:3000';
    try {
      const tokens = await this.oauthLoginUseCase.execute({
        provider,
        email: profile.email,
        nickname: profile.nickname,
        avatar: profile.avatar,
        userAgent: req.headers['user-agent'] ?? null,
        ip: req.ip ?? null,
      });
      const query = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      res.redirect(`${frontendUrl}/oauth-callback?${query.toString()}`);
    } catch {
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
}
