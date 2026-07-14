import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { CurrentUser, type AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { DeleteMediaUseCase } from '../../application/use-cases/delete-media.use-case';
import { GetMediaUseCase } from '../../application/use-cases/get-media.use-case';
import { UploadMediaUseCase } from '../../application/use-cases/upload-media.use-case';
import { UploadMediaDto } from '../dto/upload-media.dto';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(
    private readonly uploadMedia: UploadMediaUseCase,
    private readonly getMedia: GetMediaUseCase,
    private readonly deleteMedia: DeleteMediaUseCase,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media asset (image/audio/video) to the storage bucket' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES } }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded (expected multipart field "file")');
    }
    return this.uploadMedia.execute({
      buffer: file.buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
      size: file.size,
      type: dto.type,
      alt: dto.alt,
      uploadedById: user.sub,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a media asset by id' })
  get(@Param('id') id: string) {
    return this.getMedia.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a media asset (owner or admin only)' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.deleteMedia.execute({ id, requestedById: user.sub, requestedByRole: user.role });
    return { deleted: true };
  }
}
