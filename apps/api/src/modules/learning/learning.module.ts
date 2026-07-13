import { Module } from '@nestjs/common';

import { GameplayModule } from '../../shared/infrastructure/gameplay/gameplay.module';
import { CompleteLessonUseCase } from './application/use-cases/complete-lesson.use-case';
import { GetLessonUseCase } from './application/use-cases/get-lesson.use-case';
import { ListLessonsUseCase } from './application/use-cases/list-lessons.use-case';
import { StartLessonUseCase } from './application/use-cases/start-lesson.use-case';
import { LearningController } from './presentation/controllers/learning.controller';

@Module({
  imports: [GameplayModule],
  controllers: [LearningController],
  providers: [ListLessonsUseCase, GetLessonUseCase, StartLessonUseCase, CompleteLessonUseCase],
})
export class LearningModule {}
