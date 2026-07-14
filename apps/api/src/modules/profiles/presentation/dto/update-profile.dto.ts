import { ApiPropertyOptional } from '@nestjs/swagger';
import { Theme } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'minji', minLength: 2, maxLength: 30 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  nickname?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/minji.png' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ maxLength: 280 })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @ApiPropertyOptional({ example: 'KR' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: 'Asia/Seoul' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({ example: 'en', minLength: 2, maxLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  nativeLanguage?: string;

  @ApiPropertyOptional({ example: 'ko', minLength: 2, maxLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  learningLanguage?: string;
}
