import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { OrganizationType } from '../organization-type.enum';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @IsEnum(OrganizationType)
  @IsNotEmpty()
  type: OrganizationType;
}
