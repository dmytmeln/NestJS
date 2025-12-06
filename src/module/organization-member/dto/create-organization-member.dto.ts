import { IsEnum, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { OrganizationMemberRole } from '../organization-member-role.enum';

export class CreateOrganizationMemberDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  organizationId: number;

  @IsEnum(OrganizationMemberRole)
  @IsNotEmpty()
  role: OrganizationMemberRole;
}
