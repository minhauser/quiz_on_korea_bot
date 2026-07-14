import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { appConfig } from './config/app.config';
import { validateEnv } from './config/env.validation';
import { jwtConfig } from './config/jwt.config';
import { oauthConfig } from './config/oauth.config';
import { redisConfig } from './config/redis.config';
import { storageConfig } from './config/storage.config';
import { HealthController } from './health/health.controller';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { DialoguesModule } from './modules/dialogues/dialogues.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { LearningModule } from './modules/learning/learning.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SearchModule } from './modules/search/search.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UsersModule } from './modules/users/users.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { RedisModule } from './shared/infrastructure/redis/redis.module';
import { StorageModule } from './shared/infrastructure/storage/storage.module';
import { AllExceptionsFilter } from './shared/presentation/filters/all-exceptions.filter';
import { JwtAuthGuard } from './shared/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './shared/presentation/guards/roles.guard';
import { TransformInterceptor } from './shared/presentation/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig, oauthConfig, storageConfig],
      validate: validateEnv,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    StorageModule,
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
    ProfilesModule,
    UsersModule,
    MediaModule,
    SearchModule,
    AdminModule,
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
