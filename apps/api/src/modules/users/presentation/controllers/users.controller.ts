import { Body, Controller, Delete, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { DeactivateAccountUseCase } from '../../application/use-cases/deactivate-account.use-case';
import { ChangePasswordDto } from '../dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly changePassword: ChangePasswordUseCase,
    private readonly deactivateAccount: DeactivateAccountUseCase,
  ) {}

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change the current user's password" })
  async password(@CurrentUser('sub') userId: string, @Body() dto: ChangePasswordDto) {
    await this.changePassword.execute({
      userId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return { changed: true };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate (soft-delete) the current account and revoke all sessions' })
  async remove(@CurrentUser('sub') userId: string) {
    await this.deactivateAccount.execute(userId);
    return { deactivated: true };
  }
}
