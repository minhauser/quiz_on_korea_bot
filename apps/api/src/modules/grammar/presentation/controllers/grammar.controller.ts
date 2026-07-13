import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ListGrammarUseCase } from '../../application/use-cases/list-grammar.use-case';

@ApiTags('grammar')
@ApiBearerAuth()
@Controller('grammar')
export class GrammarController {
  constructor(private readonly listGrammar: ListGrammarUseCase) {}

  @Get(':lessonId')
  @ApiOperation({ summary: 'List grammar points + examples for a lesson' })
  list(@Param('lessonId') lessonId: string) {
    return this.listGrammar.execute(lessonId);
  }
}
