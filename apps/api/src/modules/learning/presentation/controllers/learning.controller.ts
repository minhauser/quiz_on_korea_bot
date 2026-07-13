import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { CompleteLessonUseCase } from '../../application/use-cases/complete-lesson.use-case';
import { GetLessonUseCase } from '../../application/use-cases/get-lesson.use-case';
import { ListLessonsUseCase } from '../../application/use-cases/list-lessons.use-case';
import { StartLessonUseCase } from '../../application/use-cases/start-lesson.use-case';
import { CompleteLessonDto } from '../dto/complete-lesson.dto';

@ApiTags('lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LearningController {
  constructor(
    private readonly listLessons: ListLessonsUseCase,
    private readonly getLesson: GetLessonUseCase,
    private readonly startLesson: StartLessonUseCase,
    private readonly completeLesson: CompleteLessonUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List published lessons with unlock state and this user’s progress' })
  list(@CurrentUser('sub') userId: string) {
    return this.listLessons.execute(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full lesson detail (vocabulary, grammar, dialogues, quiz list)' })
  detail(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.getLesson.execute(id, userId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Mark a lesson as started for the current user' })
  start(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.startLesson.execute(id, userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a lesson as completed and award XP/coins (once)' })
  complete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.completeLesson.execute({ lessonId: id, userId, score: dto.score });
  }
}
