import { IsInt, IsPositive } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  ticketTypeId: number;
}
