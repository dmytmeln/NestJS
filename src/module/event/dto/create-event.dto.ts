import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from '../location-type.enum';
import { IsBefore } from 'src/common/decorator/is-before.decorator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  bannerImageUrl?: string;

  @Type(() => Date)
  @IsDate()
  @IsBefore('endTime', { message: 'startTime must be before endTime' })
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsEnum(LocationType)
  locationType: LocationType;

  @ValidateIf(
    (o) =>
      o.locationType === LocationType.OFFLINE ||
      o.locationType === LocationType.HYBRID,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Location address is required for OFFLINE or HYBRID events',
  })
  locationAddress?: string;

  @ValidateIf(
    (o) =>
      o.locationType === LocationType.ONLINE ||
      o.locationType === LocationType.HYBRID,
  )
  @IsString()
  @IsUrl(
    {},
    { message: 'Valid online URL is required for ONLINE or HYBRID events' },
  )
  onlineUrl?: string;

  @IsNotEmpty()
  @IsPositive()
  organizationId: number;
}
