import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotifications: ListNotificationsUseCase,
    private readonly markRead: MarkNotificationReadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List recent notifications and the unread count' })
  list(@CurrentUser('sub') userId: string) {
    return this.listNotifications.execute(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  read(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.markRead.execute(userId, id);
  }
}
