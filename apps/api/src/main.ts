import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const globalPrefix = config.get<string>('app.globalPrefix') ?? 'api';
  const version = config.get<string>('app.version') ?? 'v1';
  app.setGlobalPrefix(`${globalPrefix}/${version}`);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('app.corsOrigin') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Korea Study Platform API')
    .setDescription('REST API for the Korea Study Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const port = config.get<number>('app.port') ?? 4000;
  await app.listen(port);
}

void bootstrap();
