import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
  Request,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.feedbackService.create(createFeedbackDto, req.user.userId);
  }

  @Put(':id')
  update(
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.feedbackService.update(+id, updateFeedbackDto, req.user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.feedbackService.remove(+id, req.user);
  }

  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async getEventFeedback(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.feedbackService.findByEvent(eventId, req.user);
  }
}
