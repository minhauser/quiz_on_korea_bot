import { Module } from '@nestjs/common';

import { ListGrammarUseCase } from './application/use-cases/list-grammar.use-case';
import { GrammarController } from './presentation/controllers/grammar.controller';

@Module({
  controllers: [GrammarController],
  providers: [ListGrammarUseCase],
})
export class GrammarModule {}
