import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsBefore } from 'src/common/decorator/is-before.decorator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Date)
  @IsDate()
  @IsBefore('endTime', {
    message: 'Session start time must be before end time',
  })
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsOptional()
  @IsString()
  hallName?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  onlineUrl?: string;

  @IsInt()
  @IsPositive()
  eventId: number;
}
