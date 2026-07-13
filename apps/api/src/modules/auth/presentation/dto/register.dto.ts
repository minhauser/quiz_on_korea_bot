import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'S3curePass!', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'minji', minLength: 2, maxLength: 30 })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  nickname!: string;

  @ApiProperty({ example: 'en', minLength: 2, maxLength: 10 })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  nativeLanguage!: string;
}
