import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { TicketService } from '../../module/ticket/ticket.service';
import { JwtAuthGuard } from '../../module/auth/guards/jwt-auth.guard';
import { Roles } from '../../module/auth/decorators/roles.decorator';
import { UserRole } from '../../module/auth/roles.enum';
import { RolesGuard } from '../../module/auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('gatekeeper')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)
@ApiBearerAuth()
export class GatekeeperController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('check-in')
  async checkIn(@Query('token') token: string) {
    return this.ticketService.checkInByToken(token);
  }

  @Post('join')
  async join(@Query('tokenId', ParseIntPipe) tokenId: number) {
    const onlineUrl = await this.ticketService.getOnlineJoinLink(tokenId);
    return { onlineUrl };
  }

  @Get('attendees')
  async getAttendees(
    @Query('eventId', ParseIntPipe) eventId: number,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.ticketService.findAttendees(eventId, req.user);
  }
}
