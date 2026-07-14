import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { GetMyProfileUseCase } from '../../application/use-cases/get-my-profile.use-case';
import { UpdateMyProfileUseCase } from '../../application/use-cases/update-my-profile.use-case';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly getMyProfile: GetMyProfileUseCase,
    private readonly updateMyProfile: UpdateMyProfileUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's profile" })
  me(@CurrentUser('sub') userId: string) {
    return this.getMyProfile.execute(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's profile" })
  update(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.updateMyProfile.execute({ userId, ...dto });
  }
}
