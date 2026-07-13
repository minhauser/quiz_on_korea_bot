import { Module } from '@nestjs/common';

import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { ListUniversitiesUseCase } from './application/use-cases/list-universities.use-case';
import { ContentController } from './presentation/controllers/content.controller';

@Module({
  controllers: [ContentController],
  providers: [ListCategoriesUseCase, ListUniversitiesUseCase],
})
export class ContentModule {}
