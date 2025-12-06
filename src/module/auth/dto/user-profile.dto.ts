import { User } from 'src/module/user/entities/user.entity';
import { UserRole } from '../roles.enum';

export class UserProfileDto {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.createdAt = user.createdAt;
    this.role = user.role;
  }

  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  role: UserRole;
}
