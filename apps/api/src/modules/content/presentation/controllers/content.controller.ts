import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { ListUniversitiesUseCase } from '../../application/use-cases/list-universities.use-case';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly listCategories: ListCategoriesUseCase,
    private readonly listUniversities: ListUniversitiesUseCase,
  ) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List the vocabulary category tree (worlds → chapters)' })
  categories() {
    return this.listCategories.execute();
  }

  @Public()
  @Get('universities')
  @ApiOperation({ summary: 'List supported universities and their faculties' })
  universities() {
    return this.listUniversities.execute();
  }
}
