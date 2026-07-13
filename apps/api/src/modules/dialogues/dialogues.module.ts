import { Module } from '@nestjs/common';

import { ListDialoguesUseCase } from './application/use-cases/list-dialogues.use-case';
import { DialoguesController } from './presentation/controllers/dialogues.controller';

@Module({
  controllers: [DialoguesController],
  providers: [ListDialoguesUseCase],
})
export class DialoguesModule {}
