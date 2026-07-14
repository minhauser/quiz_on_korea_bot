import { Module } from '@nestjs/common';

import { DeleteMediaUseCase } from './application/use-cases/delete-media.use-case';
import { GetMediaUseCase } from './application/use-cases/get-media.use-case';
import { UploadMediaUseCase } from './application/use-cases/upload-media.use-case';
import { MediaController } from './presentation/controllers/media.controller';

@Module({
  controllers: [MediaController],
  providers: [UploadMediaUseCase, GetMediaUseCase, DeleteMediaUseCase],
})
export class MediaModule {}
