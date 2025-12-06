import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(
    @Body() createSessionDto: CreateSessionDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.sessionService.create(createSessionDto, req.user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.sessionService.update(id, updateSessionDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.sessionService.remove(id, req.user);
  }

  @Patch(':id/speakers/add')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  addSpeaker(
    @Param('id', ParseIntPipe) id: number,
    @Query('speakerId', ParseIntPipe) speakerId: number,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.sessionService.addSpeaker(id, speakerId, req.user);
  }

  @Patch(':id/speakers/remove')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  removeSpeaker(
    @Param('id', ParseIntPipe) id: number,
    @Query('speakerId', ParseIntPipe) speakerId: number,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.sessionService.removeSpeaker(id, speakerId, req.user);
  }
}
