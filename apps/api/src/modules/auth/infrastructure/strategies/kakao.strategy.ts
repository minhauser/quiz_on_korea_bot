import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-kakao';

import { type OAuthProfile } from './google.strategy';

interface KakaoAccount {
  email?: string;
  profile?: { nickname?: string; profile_image_url?: string };
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('oauth.kakao.clientId') || 'not-configured',
      clientSecret: config.get<string>('oauth.kakao.clientSecret') ?? '',
      callbackURL: config.get<string>('oauth.kakao.callbackUrl') ?? '',
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: unknown, user?: OAuthProfile | false) => void,
  ): void {
    const account = (profile._json as { kakao_account?: KakaoAccount }).kakao_account;
    const email = account?.email;
    if (!email) {
      done(new Error('Kakao account has no verified email'), false);
      return;
    }
    const oauthProfile: OAuthProfile = {
      email,
      nickname: account?.profile?.nickname ?? profile.username ?? email.split('@')[0]!,
      avatar: account?.profile?.profile_image_url ?? null,
    };
    done(null, oauthProfile);
  }
}
