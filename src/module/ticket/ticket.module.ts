import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketTypeModule } from 'src/module/ticket-type/ticket-type.module';
import { EventModule } from 'src/module/event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), TicketTypeModule, EventModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
