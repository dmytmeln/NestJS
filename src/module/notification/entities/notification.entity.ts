import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'sent_via_email', default: false })
  sentViaEmail: boolean;

  @Column({ name: 'event_id', nullable: true })
  eventId: number;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
