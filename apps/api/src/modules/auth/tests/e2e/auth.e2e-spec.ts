import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../../../app.module';

/**
 * Requires a running Postgres (DATABASE_URL) and JWT secrets in the env.
 * Run via `pnpm --filter @ksp/api test:e2e`. Skipped in the unit run.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  const email = `e2e_${Date.now()}@example.com`;
  const password = 'password123';

  it('registers → logs in → refreshes → reaches /me', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/api/v1/auth/register')
      .send({ email, password, nickname: 'tester', nativeLanguage: 'en' })
      .expect(201);

    const login = await request(server)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const { accessToken, refreshToken } = login.body.data as {
      accessToken: string;
      refreshToken: string;
    };
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const refreshed = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();

    // Old refresh token is now revoked → reuse must be rejected.
    await request(server).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);

    await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(server).get('/api/v1/auth/me').expect(401);
  });
});
