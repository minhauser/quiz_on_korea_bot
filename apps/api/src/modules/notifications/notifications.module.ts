import { Module } from '@nestjs/common';

import { ListNotificationsUseCase } from './application/use-cases/list-notifications.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { NotificationsController } from './presentation/controllers/notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [ListNotificationsUseCase, MarkNotificationReadUseCase],
})
export class NotificationsModule {}
