import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';

export interface OAuthProfile {
  email: string;
  nickname: string;
  avatar: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    // passport-oauth2 throws synchronously if clientID/clientSecret are empty, which would
    // crash the whole app on boot. Fall back to a placeholder so unconfigured OAuth just
    // fails at request time (Google rejects the placeholder) instead of at startup.
    super({
      clientID: config.get<string>('oauth.google.clientId') || 'not-configured',
      clientSecret: config.get<string>('oauth.google.clientSecret') || 'not-configured',
      callbackURL: config.get<string>('oauth.google.callbackUrl') ?? '',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google account has no email'), false);
      return;
    }
    const oauthProfile: OAuthProfile = {
      email,
      nickname: profile.displayName || email.split('@')[0]!,
      avatar: profile.photos?.[0]?.value ?? null,
    };
    done(null, oauthProfile);
  }
}
