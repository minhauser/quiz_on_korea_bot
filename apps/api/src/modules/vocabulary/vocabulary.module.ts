import { Module } from '@nestjs/common';

import { GameplayModule } from '../../shared/infrastructure/gameplay/gameplay.module';
import { ListVocabularyUseCase } from './application/use-cases/list-vocabulary.use-case';
import { ReviewVocabularyUseCase } from './application/use-cases/review-vocabulary.use-case';
import { VocabularyController } from './presentation/controllers/vocabulary.controller';

@Module({
  imports: [GameplayModule],
  controllers: [VocabularyController],
  providers: [ListVocabularyUseCase, ReviewVocabularyUseCase],
})
export class VocabularyModule {}
