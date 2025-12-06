import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../auth/roles.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Incorrect email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEnum(UserRole, { message: 'Role must be a valid UserRole value' })
  @IsNotEmpty()
  role: UserRole;
}
