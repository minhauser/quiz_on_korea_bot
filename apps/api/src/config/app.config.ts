import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  globalPrefix: process.env.API_GLOBAL_PREFIX ?? 'api',
  version: process.env.API_VERSION ?? 'v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },
}));
