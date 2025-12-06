import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('speakers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Get()
  findAll(@Query() query: { search?: string }) {
    return this.speakerService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(@Body() createSpeakerDto: CreateSpeakerDto) {
    return this.speakerService.create(createSpeakerDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateSpeakerDto: UpdateSpeakerDto) {
    return this.speakerService.update(+id, updateSpeakerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.speakerService.remove(+id);
  }
}
