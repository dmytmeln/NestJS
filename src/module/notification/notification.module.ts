import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Event } from '../event/entities/event.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Event, Ticket])],
  controllers: [NotificationController],
  providers: [NotificationService, MailService],
})
export class NotificationModule {}
