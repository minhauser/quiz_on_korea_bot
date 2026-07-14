import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, PartOfSpeech } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateExampleSentenceDto {
  @ApiProperty()
  @IsString()
  sentenceKo!: string;

  @ApiProperty()
  @IsString()
  translation!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grammarNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  context?: string;
}

export class CreateVocabularyDto {
  @ApiProperty()
  @IsUUID()
  lessonId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  word!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  romanization?: string;

  @ApiProperty()
  @IsString()
  translation!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pronunciation?: string;

  @ApiPropertyOptional({ enum: PartOfSpeech })
  @IsOptional()
  @IsEnum(PartOfSpeech)
  partOfSpeech?: PartOfSpeech;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  frequency?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ type: [CreateExampleSentenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExampleSentenceDto)
  exampleSentences?: CreateExampleSentenceDto[];
}

export class UpdateVocabularyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  word?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  romanization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  translation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pronunciation?: string;

  @ApiPropertyOptional({ enum: PartOfSpeech })
  @IsOptional()
  @IsEnum(PartOfSpeech)
  partOfSpeech?: PartOfSpeech;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  frequency?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}
