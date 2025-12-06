import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('ticket-types')
export class TicketTypeController {
  constructor(private ticketTypeService: TicketTypeService) {}

  @Get()
  findAll(@Query('eventId') eventId: string) {
    return this.ticketTypeService.findByEvent(+eventId);
  }

  @Get(':id')
  getTicket(@Param('id', ParseIntPipe) id: number) {
    return this.ticketTypeService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  create(
    @Body() createDto: CreateTicketTypeDto,
    @Request() request: { user: { userId: number; role: UserRole } },
  ) {
    return this.ticketTypeService.create(createDto, request.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTicketTypeDto,
    @Request() request: { user: { userId: number; role: UserRole } },
  ) {
    return this.ticketTypeService.update(id, updateDto, request.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: { user: { userId: number; role: UserRole } },
  ) {
    return this.ticketTypeService.remove(id, request.user);
  }
}
