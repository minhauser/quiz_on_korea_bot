import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ReviewVocabularyDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  correct!: boolean;
}
