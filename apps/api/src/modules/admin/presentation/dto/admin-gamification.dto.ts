import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, MissionPeriod, Rarity, RewardType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMissionDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  goal!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rewardXp?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rewardCoins?: number;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ enum: MissionPeriod })
  @IsOptional()
  @IsEnum(MissionPeriod)
  period?: MissionPeriod;

  @ApiPropertyOptional({
    description: 'manual, or one of: lessons_completed, words_learned, quiz_high_score, streak_active',
  })
  @IsOptional()
  @IsString()
  metric?: string;
}

export class UpdateMissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  goal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rewardXp?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rewardCoins?: number;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ enum: MissionPeriod })
  @IsOptional()
  @IsEnum(MissionPeriod)
  period?: MissionPeriod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metric?: string;
}

export class CreateRewardDto {
  @ApiProperty({ enum: RewardType })
  @IsEnum(RewardType)
  type!: RewardType;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ enum: Rarity })
  @IsOptional()
  @IsEnum(Rarity)
  rarity?: Rarity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRewardDto {
  @ApiPropertyOptional({ enum: RewardType })
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ enum: Rarity })
  @IsOptional()
  @IsEnum(Rarity)
  rarity?: Rarity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
