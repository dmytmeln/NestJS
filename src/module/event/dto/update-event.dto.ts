import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { EventStatus } from '../event-status.enum';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  status?: EventStatus;
}
