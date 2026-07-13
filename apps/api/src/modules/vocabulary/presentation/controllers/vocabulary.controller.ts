import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { ListVocabularyUseCase } from '../../application/use-cases/list-vocabulary.use-case';
import { ReviewVocabularyUseCase } from '../../application/use-cases/review-vocabulary.use-case';
import { ReviewVocabularyDto } from '../dto/review-vocabulary.dto';

@ApiTags('vocabulary')
@ApiBearerAuth()
@Controller('vocabulary')
export class VocabularyController {
  constructor(
    private readonly listVocabulary: ListVocabularyUseCase,
    private readonly reviewVocabulary: ReviewVocabularyUseCase,
  ) {}

  @Get(':lessonId')
  @ApiOperation({ summary: 'List vocabulary + examples for a lesson, with this user’s progress' })
  list(@Param('lessonId') lessonId: string, @CurrentUser('sub') userId: string) {
    return this.listVocabulary.execute(lessonId, userId);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Record a spaced-repetition review attempt for a word' })
  review(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ReviewVocabularyDto,
  ) {
    return this.reviewVocabulary.execute({ wordId: id, userId, correct: dto.correct });
  }
}
