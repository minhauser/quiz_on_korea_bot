import { Module } from '@nestjs/common';

import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/update-my-profile.use-case';
import { ProfilesController } from './presentation/controllers/profiles.controller';

@Module({
  controllers: [ProfilesController],
  providers: [GetMyProfileUseCase, UpdateMyProfileUseCase],
})
export class ProfilesModule {}
