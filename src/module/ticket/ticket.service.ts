import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketResponse } from './dto/ticket-response.dto';
import { TicketTypeService } from 'src/module/ticket-type/ticket-type.service';
import { Not } from 'typeorm';
import { UserRole } from '../auth/roles.enum';
import { EventService } from 'src/module/event/event.service';
import { LocationType } from 'src/module/event/location-type.enum';
import { EventStatus } from '../event/event-status.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private ticketTypeService: TicketTypeService,
    private eventService: EventService,
  ) {}

  async findAttendees(
    eventId: number,
    user: { userId: number; role: UserRole },
  ): Promise<TicketResponse[]> {
    const event = await this.eventService.findEventById(eventId);
    await this.eventService.ensureCanManageOrganization(
      event.organization.id,
      user,
    );
    const tickets = await this.ticketRepository.find({
      where: { event: { id: eventId }, status: Not(TicketStatus.ISSUED) },
      relations: ['user', 'ticketType', 'event'],
    });
    return tickets.map((ticket) => new TicketResponse(ticket));
  }

  async create(createTicketDto: CreateTicketDto): Promise<TicketResponse> {
    const ticketType = await this.ticketTypeService.findEntity(
      createTicketDto.ticketTypeId,
    );
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }
    if (ticketType.quantity <= 0) {
      throw new NotFoundException('No tickets available for this type');
    }
    if (
      ticketType.event.status === EventStatus.PAST ||
      ticketType.event.status === EventStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Cannot purchase tickets for an event that is past or not published',
      );
    }
    const ticket = this.ticketRepository.create({
      ticketToken: randomUUID(),
      status: TicketStatus.ISSUED,
      user: { id: createTicketDto.userId },
      event: { id: ticketType.event.id },
      ticketType: { id: createTicketDto.ticketTypeId },
    });
    const savedTicket = await this.ticketRepository.save(ticket);
    this.ticketTypeService.decrementAvailableQuantity(ticketType.id);
    const ticketWithRelations = await this.findById(savedTicket.id);
    return new TicketResponse(ticketWithRelations);
  }

  async checkInByToken(token: string): Promise<TicketResponse> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketToken: token },
      relations: ['event', 'ticketType', 'payment'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found for provided token');
    }

    if (
      ticket.status !== TicketStatus.ISSUED ||
      (ticket.ticketType.price > 0 &&
        (!ticket.payment || ticket.payment.status !== 'COMPLETED')) ||
      ticket.event.locationType === LocationType.ONLINE
    ) {
      throw new BadRequestException('Ticket cannot be used');
    }

    ticket.checkedInAt = new Date();
    ticket.status = TicketStatus.USED;

    const updatedTicket = await this.ticketRepository.save(ticket);
    const ticketWithRelations = await this.findById(updatedTicket.id);
    return new TicketResponse(ticketWithRelations);
  }

  async findAll(): Promise<TicketResponse[]> {
    const tickets = await this.ticketRepository.find({
      relations: ['event', 'ticketType', 'payment'],
    });
    return tickets.map((ticket) => new TicketResponse(ticket));
  }

  async findOne(id: number, userId: number): Promise<TicketResponse> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['event', 'ticketType', 'payment'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    return new TicketResponse(ticket);
  }

  private async findById(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['event', 'ticketType', 'payment'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    return ticket;
  }

  async findByUser(userId: number): Promise<TicketResponse[]> {
    const tickets = await this.ticketRepository.find({
      where: { user: { id: userId } },
      relations: ['event', 'ticketType', 'payment'],
    });
    return tickets.map((ticket) => new TicketResponse(ticket));
  }

  async getOnlineJoinLink(ticketId: number): Promise<string> {
    const ticket = await this.findById(ticketId);

    if (ticket.event.locationType === LocationType.OFFLINE) {
      throw new NotFoundException(
        `Event ${ticket.event.title} has no online URL configured`,
      );
    }

    if (
      (ticket.ticketType.price > 0 &&
        (!ticket.payment || ticket.payment.status !== 'COMPLETED')) ||
      ticket.status !== TicketStatus.ISSUED
    ) {
      throw new BadRequestException('Ticket cannot be used');
    }

    return ticket.event.onlineUrl;
  }

  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
  ): Promise<TicketResponse> {
    const ticket = await this.findById(id);
    Object.assign(ticket, updateTicketDto);
    const updatedTicket = await this.ticketRepository.save(ticket);
    const ticketWithRelations = await this.findById(updatedTicket.id);
    return new TicketResponse(ticketWithRelations);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findById(id);
    await this.ticketRepository.remove(ticket);
  }

  async hasValidTicketForEvent(
    userId: number,
    eventId: number,
  ): Promise<boolean> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
        status: Not(TicketStatus.REFUNDED),
      },
      relations: ['ticketType', 'payment'],
    });

    if (!ticket) {
      return false;
    }

    if (
      ticket.ticketType.price > 0 &&
      (!ticket.payment || ticket.payment.status !== 'COMPLETED')
    ) {
      return false;
    }

    return true;
  }
}
