import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class QuizAnswerDto {
  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  optionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textAnswer?: string;
}

export class AttemptQuizDto {
  @ApiProperty({ type: [QuizAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers!: QuizAnswerDto[];

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
