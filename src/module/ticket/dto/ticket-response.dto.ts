import { Ticket } from '../entities/ticket.entity';

export class TicketResponse {
  id: number;
  status: string;
  checkedInAt: Date;

  event?: {
    id: number;
    title: string;
    startTime: Date;
    endTime: Date;
    locationType: string;
  };

  ticketType?: {
    id: number;
    name: string;
    price: number;
  };

  user?: {
    id: number;
    email: string;
  };

  payment?: {
    id: number;
    status: string;
    amount: number;
  };

  constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.status = ticket.status;
    this.checkedInAt = ticket.checkedInAt;

    if (ticket.event) {
      this.event = {
        id: ticket.event.id,
        title: ticket.event.title,
        startTime: ticket.event.startTime,
        endTime: ticket.event.endTime,
        locationType: ticket.event.locationType,
      };
    }

    if (ticket.ticketType) {
      this.ticketType = {
        id: ticket.ticketType.id,
        name: ticket.ticketType.name,
        price: ticket.ticketType.price,
      };
    }

    if (ticket.payment) {
      this.payment = {
        id: ticket.payment.id,
        status: ticket.payment.status,
        amount: ticket.payment.amount,
      };
    }

    if (ticket.user) {
      this.user = {
        id: ticket.user.id,
        email: ticket.user.email,
      };
    }
  }
}
