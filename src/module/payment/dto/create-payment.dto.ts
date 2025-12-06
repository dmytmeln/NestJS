export class CreatePaymentDto {
  amount: number;
  status: string;
  provider: string;
  transactionId: string;
  ticketId: number;
}
