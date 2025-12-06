import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../auth/roles.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
