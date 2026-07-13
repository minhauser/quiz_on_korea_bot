import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { GetDueReviewsUseCase } from '../../application/use-cases/get-due-reviews.use-case';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly getDueReviews: GetDueReviewsUseCase) {}

  @Get('due')
  @ApiOperation({ summary: 'Get vocabulary words and lessons due for spaced-repetition review today' })
  due(@CurrentUser('sub') userId: string) {
    return this.getDueReviews.execute(userId);
  }
}
