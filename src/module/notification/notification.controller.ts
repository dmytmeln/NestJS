import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('userId') userId: string) {
    return this.notificationService.findByUser(+userId);
  }

  @Get('me')
  findMy(@Request() req: { user: { userId: number } }) {
    return this.notificationService.findByUser(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ) {
    return this.notificationService.markAsRead(+id, req.user.userId);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: { user: { userId: number } }) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }
}
