import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Event } from '../event/entities/event.entity';
import { OrganizationMember } from '../organization-member/entities/organization-member.entity';
import { OrganizationMemberService } from '../organization-member/organization-member.service';
import { Speaker } from 'src/module/speaker/entities/speaker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Event, OrganizationMember, Speaker]),
  ],
  controllers: [SessionController],
  providers: [SessionService, OrganizationMemberService],
  exports: [SessionService],
})
export class SessionModule {}
