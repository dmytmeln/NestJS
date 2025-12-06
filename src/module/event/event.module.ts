import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { OrganizationMemberModule } from 'src/module/organization-member/organization-member.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), OrganizationMemberModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
