export enum TicketStatus {
  ISSUED = 'ISSUED',
  USED = 'USED',
  REFUNDED = 'REFUNDED',
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { TicketType } from '../../ticket-type/entities/ticket-type.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_token', unique: true })
  ticketToken: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.ISSUED,
  })
  status: TicketStatus;

  @Column({ name: 'checked_in_at', nullable: true })
  checkedInAt: Date;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment | null;
}
