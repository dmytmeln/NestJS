import { UserRole } from '../../auth/roles.enum';
import { User } from '../entities/user.entity';

export class UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }
}
