import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { SessionModule } from 'src/module/session/session.module';
import { EventModule } from 'src/module/event/event.module';
import { OrganizationMemberModule } from 'src/module/organization-member/organization-member.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback]),
    SessionModule,
    EventModule,
    OrganizationMemberModule,
    TicketModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
