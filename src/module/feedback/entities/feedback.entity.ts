import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { Session } from '../../session/entities/session.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Session, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
