import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ATTENDEE)
  purchase(
    @Query('ticketTypeId', ParseIntPipe) ticketTypeId: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.ticketService.create({ ticketTypeId, userId: req.user.userId });
  }

  @Post('webhook')
  webhook(@Body() body: { transactionId: string; status: string }) {
    return { message: 'Webhook received' };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyTickets(@Request() req: { user: { userId: number } }) {
    return this.ticketService.findByUser(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTicket(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ) {
    return this.ticketService.findOne(+id, req.user.userId);
  }
}
