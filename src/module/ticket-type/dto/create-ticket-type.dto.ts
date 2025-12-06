import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsPositive()
  eventId: number;
}
