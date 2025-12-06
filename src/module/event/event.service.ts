import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventResponse } from './dto/event-response.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventSearch } from './event.controller';
import { EventStatus } from './event-status.enum';
import { OrganizationMemberService } from '../organization-member/organization-member.service';
import { UserRole } from '../auth/roles.enum';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private organizationMemberService: OrganizationMemberService,
  ) {}

  async ensureCanManageOrganization(
    organizationId: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role !== UserRole.ORGANIZER) {
      throw new ForbiddenException(
        'You do not have permission to manage events',
      );
    }

    const membership =
      await this.organizationMemberService.findByUserAndOrganization(
        currentUser.userId,
        organizationId,
      );

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of the organization that owns this event',
      );
    }
  }

  async findEventById(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organization', 'sessions', 'ticketTypes'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  async create(
    createEventDto: CreateEventDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<EventResponse> {
    await this.ensureCanManageOrganization(
      createEventDto.organizationId,
      currentUser,
    );
    if (currentUser.role !== UserRole.ADMIN) {
      const membership =
        await this.organizationMemberService.findByUserAndOrganization(
          currentUser.userId,
          createEventDto.organizationId,
        );

      if (!membership) {
        throw new ForbiddenException(
          'You can only create events for organizations you belong to',
        );
      }
    }
    const { organizationId, ...eventData } = createEventDto;

    const event = this.eventRepository.create({
      ...eventData,
      organization: { id: organizationId },
    });
    const savedEvent = await this.eventRepository.save(event);
    const eventWithRelations = await this.findEventById(savedEvent.id);

    return new EventResponse(eventWithRelations);
  }

  async findAll(query?: QueryEventSearch): Promise<{
    items: EventResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.status != :status', { status: EventStatus.DRAFT });

    if (query?.date) {
      queryBuilder.where('DATE(event.startTime) = :date', { date: query.date });
    }

    if (query?.type) {
      queryBuilder.andWhere('event.locationType = :type', { type: query.type });
    }

    if (query?.search) {
      queryBuilder.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 10);

    const [items, total] = await queryBuilder
      .leftJoinAndSelect('event.organization', 'organization')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((event) => new EventResponse(event)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<EventResponse> {
    const event = await this.findEventById(id);
    return new EventResponse(event);
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<EventResponse> {
    const event = await this.findEventById(id);
    await this.ensureCanManageOrganization(event.organization.id, currentUser);

    Object.assign(event, updateEventDto);
    const updatedEvent = await this.eventRepository.save(event);
    const eventWithRelations = await this.findEventById(updatedEvent.id);

    return new EventResponse(eventWithRelations);
  }

  async updateStatus(
    id: number,
    status: EventStatus,
    currentUser: { userId: number; role: UserRole },
  ): Promise<EventResponse> {
    const event = await this.findEventById(id);
    await this.ensureCanManageOrganization(event.organization.id, currentUser);

    event.status = status;
    const updatedEvent = await this.eventRepository.save(event);
    const eventWithRelations = await this.findEventById(updatedEvent.id);

    return new EventResponse(eventWithRelations);
  }

  async getSessions(id: number) {
    const event = await this.findEventById(id);
    return event.sessions;
  }

  async remove(
    id: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<void> {
    const event = await this.findEventById(id);
    await this.ensureCanManageOrganization(event.organization.id, currentUser);
    await this.eventRepository.remove(event);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateEventStatusesBySchedule(): Promise<void> {
    const now = new Date();

    await this.eventRepository
      .createQueryBuilder()
      .update(Event)
      .set({ status: EventStatus.LIVE })
      .where('status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('start_time <= :now', { now })
      .andWhere('end_time > :now', { now })
      .execute();

    await this.eventRepository
      .createQueryBuilder()
      .update(Event)
      .set({ status: EventStatus.PAST })
      .where('status IN (:...statuses)', {
        statuses: [EventStatus.PUBLISHED, EventStatus.LIVE],
      })
      .andWhere('end_time <= :now', { now })
      .execute();
  }
}
