import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateDialogueLineDto {
  @ApiProperty()
  @IsString()
  speaker!: string;

  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty()
  @IsString()
  translation!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateDialogueDto {
  @ApiProperty()
  @IsUUID()
  lessonId!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  scenario!: string;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;

  @ApiPropertyOptional({ type: [CreateDialogueLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDialogueLineDto)
  lines?: CreateDialogueLineDto[];
}

export class UpdateDialogueDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scenario?: string;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;
}
