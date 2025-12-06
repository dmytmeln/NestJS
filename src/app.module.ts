import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './module/user/user.module';
import { EventModule } from './module/event/event.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from './data-source';
import { OrganizationModule } from './module/organization/organization.module';
import { SessionModule } from './module/session/session.module';
import { TicketModule } from './module/ticket/ticket.module';
import { FeedbackModule } from './module/feedback/feedback.module';
import { SpeakerModule } from './module/speaker/speaker.module';
import { AuthController } from './module/auth/auth.controller';
import { GatekeeperController } from './common/gatekeeper/gatekeeper.controller';
import { NotificationModule } from './module/notification/notification.module';
import { AuthModule } from './module/auth/auth.module';
import { TicketTypeModule } from './module/ticket-type/ticket-type.module';

@Module({
  imports: [
    UserModule,
    EventModule,
    TypeOrmModule.forRoot(dataSourceConfig),
    OrganizationModule,
    SessionModule,
    TicketModule,
    FeedbackModule,
    SpeakerModule,
    NotificationModule,
    AuthModule,
    ScheduleModule.forRoot(),
    TicketTypeModule,
  ],
  controllers: [AuthController, GatekeeperController],
})
export class AppModule {}
