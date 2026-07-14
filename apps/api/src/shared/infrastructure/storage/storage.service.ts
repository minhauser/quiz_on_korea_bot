import { randomUUID } from 'node:crypto';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadFileInput {
  buffer: Buffer;
  mimeType: string;
  folder: string;
  fileName: string;
}

export interface UploadedFile {
  key: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>('storage.bucket');
    this.publicUrl = config.getOrThrow<string>('storage.publicUrl');
    this.client = new S3Client({
      endpoint: config.getOrThrow<string>('storage.endpoint'),
      region: config.getOrThrow<string>('storage.region'),
      forcePathStyle: config.get<boolean>('storage.forcePathStyle') ?? true,
      credentials: {
        accessKeyId: config.getOrThrow<string>('storage.accessKeyId'),
        secretAccessKey: config.getOrThrow<string>('storage.secretAccessKey'),
      },
    });
  }

  async upload(input: UploadFileInput): Promise<UploadedFile> {
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${input.folder}/${randomUUID()}-${safeName}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
      }),
    );
    return { key, url: `${this.publicUrl}/${this.bucket}/${key}` };
  }
}
