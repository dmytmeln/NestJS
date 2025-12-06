import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(paymentData: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(paymentData);
    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    return payment;
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.paymentRepository.findOneBy({ transactionId });
  }

  async update(id: number, updateData: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updateData);
    return this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}
