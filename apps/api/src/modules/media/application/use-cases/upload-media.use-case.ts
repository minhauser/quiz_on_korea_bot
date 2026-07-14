import { Injectable } from '@nestjs/common';
import { type MediaType } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { StorageService } from '../../../../shared/infrastructure/storage/storage.service';

export interface UploadMediaCommand {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  size: number;
  type: MediaType;
  alt?: string;
  uploadedById: string;
}

const FOLDER_BY_TYPE: Record<MediaType, string> = {
  IMAGE: 'images',
  AUDIO: 'audio',
  ILLUSTRATION: 'illustrations',
  ICON: 'icons',
  LESSON_ASSET: 'lesson-assets',
  VIDEO: 'video',
};

@Injectable()
export class UploadMediaUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async execute(command: UploadMediaCommand) {
    const { url } = await this.storage.upload({
      buffer: command.buffer,
      mimeType: command.mimeType,
      fileName: command.fileName,
      folder: FOLDER_BY_TYPE[command.type],
    });

    return this.prisma.mediaLibrary.create({
      data: {
        type: command.type,
        url,
        fileName: command.fileName,
        mimeType: command.mimeType,
        size: command.size,
        alt: command.alt,
        uploadedById: command.uploadedById,
      },
    });
  }
}
