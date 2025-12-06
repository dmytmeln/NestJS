import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTicketTypeDto } from './create-ticket-type.dto';

export class UpdateTicketTypeDto extends PartialType(
  OmitType(CreateTicketTypeDto, ['eventId']),
) {}
