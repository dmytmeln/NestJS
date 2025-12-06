import { TicketType } from '../entities/ticket-type.entity';

export class TicketTypeResponse {
  id: number;
  name: string;
  price: number;
  availableQuantity: number;
  soldCount: number;

  event: {
    id: number;
    title: string;
  };

  constructor(ticketType: TicketType) {
    this.id = ticketType.id;
    this.name = ticketType.name;
    this.price = ticketType.price;
    this.availableQuantity = ticketType.quantity;
    this.soldCount = ticketType.soldCount;
    this.event = {
      id: ticketType.event.id,
      title: ticketType.event.title,
    };
  }
}
