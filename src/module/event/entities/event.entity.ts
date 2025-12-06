import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { Session } from '../../session/entities/session.entity';
import { TicketType } from '../../ticket-type/entities/ticket-type.entity';
import { EventStatus } from '../event-status.enum';
import { LocationType } from '../location-type.enum';
import { Feedback } from 'src/module/feedback/entities/feedback.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'banner_image_url', nullable: true })
  bannerImageUrl: string;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: LocationType,
  })
  locationType: LocationType;

  @Column({ name: 'location_address', nullable: true })
  locationAddress: string;

  @Column({ name: 'online_url', nullable: true })
  onlineUrl: string;

  @Column({ default: EventStatus.DRAFT })
  status: EventStatus;

  @ManyToOne(() => Organization, (org) => org.events)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Session, (session) => session.event)
  sessions: Session[];

  @OneToMany(() => TicketType, (type) => type.event)
  ticketTypes: TicketType[];

  @OneToMany(() => Feedback, (feedback) => feedback.event)
  feedbacks: Feedback[];
}
