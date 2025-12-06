import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { EventStatus } from './event-status.enum';
import { Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  findAll(@Query() query: QueryEventSearch) {
    return this.eventService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(
    @Body() createEventDto: CreateEventDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.eventService.create(createEventDto, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.eventService.update(+id, updateEventDto, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: EventStatus },
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.eventService.updateStatus(+id, body.status, req.user);
  }

  @Get(':id/sessions')
  getSessions(@Param('id') id: string) {
    return this.eventService.getSessions(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.eventService.remove(+id, req.user);
  }
}

export type QueryEventSearch = {
  date?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
};
