import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrganizationMember } from '../../organization-member/entities/organization-member.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { UserRole } from '../../auth/roles.enum';
import { Feedback } from 'src/module/feedback/entities/feedback.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.ATTENDEE })
  role: UserRole;

  @OneToMany(() => OrganizationMember, 'user')
  memberships: OrganizationMember[];

  @OneToMany(() => Ticket, 'user')
  tickets: Ticket[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
