import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeResponse } from './dto/ticket-type-response.dto';
import { UserRole } from '../auth/roles.enum';
import { EventService } from 'src/module/event/event.service';
import { EventStatus } from '../event/event-status.enum';

@Injectable()
export class TicketTypeService {
  constructor(
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    private eventService: EventService,
  ) {}

  async create(
    createDto: CreateTicketTypeDto,
    user: { userId: number; role: UserRole },
  ): Promise<TicketTypeResponse> {
    const { eventId, ...restTicketType } = createDto;
    const event = await this.eventService.findEventById(eventId);
    await this.eventService.ensureCanManageOrganization(
      event.organization.id,
      user,
    );
    const ticketType = this.ticketTypeRepository.create({
      event: { id: eventId },
      ...restTicketType,
    });
    const savedTicketType = await this.ticketTypeRepository.save(ticketType);
    const ticketTypeWithRelations = await this.ticketTypeRepository.findOne({
      where: { id: savedTicketType.id },
      relations: ['event'],
    });
    if (!ticketTypeWithRelations) {
      throw new Error('Failed to load created ticket type');
    }
    return new TicketTypeResponse(ticketTypeWithRelations);
  }

  async findAll(): Promise<TicketTypeResponse[]> {
    const ticketTypes = await this.ticketTypeRepository.find({
      relations: ['event'],
    });
    return ticketTypes.map((ticketType) => new TicketTypeResponse(ticketType));
  }

  async findOne(id: number): Promise<TicketTypeResponse> {
    const ticketType = await this.findEntity(id);
    return new TicketTypeResponse(ticketType);
  }

  async findEntity(id: number): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!ticketType) {
      throw new NotFoundException(`Ticket type with id ${id} not found`);
    }
    return ticketType;
  }

  async findByEvent(eventId: number): Promise<TicketTypeResponse[]> {
    const ticketTypes = await this.ticketTypeRepository.find({
      where: {
        event: { id: eventId, status: Not(EventStatus.PAST) },
      },
      relations: ['event'],
    });
    return ticketTypes.map((ticketType) => new TicketTypeResponse(ticketType));
  }

  async update(
    id: number,
    updateData: UpdateTicketTypeDto,
    user: { userId: number; role: UserRole },
  ): Promise<TicketTypeResponse> {
    const ticketType = await this.findEntity(id);

    if (!ticketType) {
      throw new NotFoundException(`Ticket type with id ${id} not found`);
    }

    const event = await this.eventService.findEventById(ticketType.event.id);
    await this.eventService.ensureCanManageOrganization(
      event.organization.id,
      user,
    );

    Object.assign(ticketType, updateData);
    const updatedTicketType = await this.ticketTypeRepository.save(ticketType);
    return new TicketTypeResponse(updatedTicketType);
  }

  async decrementAvailableQuantity(ticketTypeId: number): Promise<void> {
    const ticketType = await this.findEntity(ticketTypeId);
    if (ticketType && ticketType.quantity > 0) {
      ticketType.quantity--;
      ticketType.soldCount++;
      await this.ticketTypeRepository.save(ticketType);
    }
  }

  async remove(
    id: number,
    user: { userId: number; role: UserRole },
  ): Promise<void> {
    const ticketType = await this.findEntity(id);
    const event = await this.eventService.findEventById(ticketType.event.id);
    await this.eventService.ensureCanManageOrganization(
      event.organization.id,
      user,
    );
    await this.ticketTypeRepository.remove(ticketType);
  }
}
