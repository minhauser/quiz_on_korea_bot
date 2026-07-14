import { Module } from '@nestjs/common';

import { GameplayModule } from '../../shared/infrastructure/gameplay/gameplay.module';

import { AttemptQuizUseCase } from './application/use-cases/attempt-quiz.use-case';
import { GetLessonQuizzesUseCase } from './application/use-cases/get-lesson-quizzes.use-case';
import { QuizzesController } from './presentation/controllers/quizzes.controller';

@Module({
  imports: [GameplayModule],
  controllers: [QuizzesController],
  providers: [GetLessonQuizzesUseCase, AttemptQuizUseCase],
})
export class QuizzesModule {}
