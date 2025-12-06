import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsInt()
  @IsPositive()
  userId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  eventId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  sessionId?: number;
}
