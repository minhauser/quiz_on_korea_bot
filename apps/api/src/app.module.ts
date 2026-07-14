import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { appConfig } from './config/app.config';
import { validateEnv } from './config/env.validation';
import { jwtConfig } from './config/jwt.config';
import { HealthController } from './health/health.controller';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { DialoguesModule } from './modules/dialogues/dialogues.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { LearningModule } from './modules/learning/learning.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { redisConfig } from './config/redis.config';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { RedisModule } from './shared/infrastructure/redis/redis.module';
import { AllExceptionsFilter } from './shared/presentation/filters/all-exceptions.filter';
import { JwtAuthGuard } from './shared/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './shared/presentation/guards/roles.guard';
import { TransformInterceptor } from './shared/presentation/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig],
      validate: validateEnv,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    ContentModule,
    LearningModule,
    VocabularyModule,
    GrammarModule,
    DialoguesModule,
    QuizzesModule,
    ReviewsModule,
    AchievementsModule,
    GamificationModule,
    StatisticsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // Guard order matters: throttle → authenticate → authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
