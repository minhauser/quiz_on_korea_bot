import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { AttemptQuizUseCase } from '../../application/use-cases/attempt-quiz.use-case';
import { GetLessonQuizzesUseCase } from '../../application/use-cases/get-lesson-quizzes.use-case';
import { AttemptQuizDto } from '../dto/attempt-quiz.dto';

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly getLessonQuizzes: GetLessonQuizzesUseCase,
    private readonly attemptQuiz: AttemptQuizUseCase,
  ) {}

  @Get(':lessonId')
  @ApiOperation({ summary: 'Get the quiz(zes) for a lesson, including correct answers (client reveals per-question feedback immediately)' })
  list(@Param('lessonId') lessonId: string) {
    return this.getLessonQuizzes.execute(lessonId);
  }

  @Post(':id/attempt')
  @ApiOperation({ summary: 'Submit answers for a quiz attempt; grades and awards XP/coins' })
  attempt(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: AttemptQuizDto,
  ) {
    return this.attemptQuiz.execute({
      quizId: id,
      userId,
      answers: dto.answers,
      durationSeconds: dto.durationSeconds ?? 0,
    });
  }
}
