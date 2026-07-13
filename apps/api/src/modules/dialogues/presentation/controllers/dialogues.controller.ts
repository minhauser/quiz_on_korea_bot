import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ListDialoguesUseCase } from '../../application/use-cases/list-dialogues.use-case';

@ApiTags('dialogues')
@ApiBearerAuth()
@Controller('dialogues')
export class DialoguesController {
  constructor(private readonly listDialogues: ListDialoguesUseCase) {}

  @Get(':lessonId')
  @ApiOperation({ summary: 'List dialogues + lines for a lesson' })
  list(@Param('lessonId') lessonId: string) {
    return this.listDialogues.execute(lessonId);
  }
}
