import { Module } from '@nestjs/common';

import { GetDueReviewsUseCase } from './application/use-cases/get-due-reviews.use-case';
import { ReviewsController } from './presentation/controllers/reviews.controller';

@Module({
  controllers: [ReviewsController],
  providers: [GetDueReviewsUseCase],
})
export class ReviewsModule {}
