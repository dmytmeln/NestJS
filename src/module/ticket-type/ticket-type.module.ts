import { Module } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { TicketType } from './entities/ticket-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTypeController } from './ticket-type.controller';
import { EventModule } from 'src/module/event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType]), EventModule],
  providers: [TicketTypeService],
  exports: [TicketTypeService],
  controllers: [TicketTypeController],
})
export class TicketTypeModule {}
