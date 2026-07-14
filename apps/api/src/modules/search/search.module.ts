import { Module } from '@nestjs/common';

import { SearchUseCase } from './application/use-cases/search.use-case';
import { SearchController } from './presentation/controllers/search.controller';

@Module({
  controllers: [SearchController],
  providers: [SearchUseCase],
})
export class SearchModule {}
