import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string; // PENDING, COMPLETED, FAILED

  @Column({ nullable: true })
  provider: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
