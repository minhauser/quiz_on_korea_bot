import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { SearchUseCase } from '../../application/use-cases/search.use-case';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Trigram-similarity search across lessons, vocabulary, and grammar' })
  @ApiQuery({ name: 'q', required: false })
  find(@Query('q') q?: string) {
    return this.search.execute(q ?? '');
  }
}
