import { registerAs } from '@nestjs/config';

export const oauthConfig = registerAs('oauth', () => {
  const callbackBase = process.env.OAUTH_CALLBACK_URL ?? 'http://localhost:4000/api/v1/auth/callback';
  return {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: `${callbackBase}/google`,
    },
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID ?? '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? '',
      callbackUrl: `${callbackBase}/kakao`,
    },
  };
});
