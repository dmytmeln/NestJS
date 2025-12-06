import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';

@Entity('ticket_types')
export class TicketType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  quantity: number;

  @Column({ name: 'sold_count', default: 0 })
  soldCount: number;

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
