import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Speaker } from '../../speaker/entities/speaker.entity';
import { SessionStatus } from '../session-status.enum';
import { Feedback } from 'src/module/feedback/entities/feedback.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column({ name: 'hall_name', nullable: true })
  hallName: string;

  @Column({ name: 'online_url', nullable: true })
  onlineUrl: string;

  @Column({ default: SessionStatus.UPCOMING })
  status: SessionStatus;

  @ManyToOne(() => Event, (event) => event.sessions)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToMany(() => Speaker)
  @JoinTable({
    name: 'session_speakers',
    joinColumn: { name: 'session_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'speaker_id', referencedColumnName: 'id' },
  })
  speakers: Speaker[];

  @OneToMany(() => Feedback, (feedback) => feedback.session)
  feedbacks: Feedback[];
}
