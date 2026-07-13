import { ApiProperty } from '@nestjs/swagger';

export class TokensResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}

export class RegisterResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;
}

export class MeResponseDto {
  @ApiProperty({ description: 'User id (JWT subject).' })
  sub!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;
}
