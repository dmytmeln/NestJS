import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionStatus } from './session-status.enum';
import { Event } from '../event/entities/event.entity';
import { OrganizationMemberService } from '../organization-member/organization-member.service';
import { UserRole } from '../auth/roles.enum';
import { SessionResponse } from './dto/session-response.dto';
import { Speaker } from 'src/module/speaker/entities/speaker.entity';
import { LocationType } from '../event/location-type.enum';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Speaker)
    private speakerRepository: Repository<Speaker>,
    private organizationMemberService: OrganizationMemberService,
  ) {}

  private async ensureCanManageEvent(
    eventId: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role !== UserRole.ORGANIZER) {
      throw new ForbiddenException(
        'You do not have permission to manage sessions',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['organization'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const membership =
      await this.organizationMemberService.findByUserAndOrganization(
        currentUser.userId,
        event.organization.id,
      );

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of the organization that owns this event',
      );
    }
  }

  async create(
    createSessionDto: CreateSessionDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<SessionResponse> {
    await this.ensureCanManageEvent(createSessionDto.eventId, currentUser);

    const { eventId, ...sessionData } = createSessionDto;
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      select: {
        startTime: true,
        endTime: true,
        locationType: true,
      },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with ID ${createSessionDto.eventId} not found`,
      );
    }

    const sessionStart = new Date(createSessionDto.startTime);
    const sessionEnd = new Date(createSessionDto.endTime);

    if (sessionStart < event.startTime || sessionEnd > event.endTime) {
      throw new BadRequestException(
        `Session time must be within event duration (${event.startTime.toISOString()} - ${event.endTime.toISOString()})`,
      );
    }

    this.validateSessionLocation(
      event.locationType,
      sessionData.hallName,
      sessionData.onlineUrl,
    );

    const session = this.sessionRepository.create({
      ...sessionData,
      event: { id: eventId },
    });
    const savedSession = await this.sessionRepository.save(session);
    return new SessionResponse(savedSession);
  }

  private validateSessionLocation(
    type: LocationType,
    hallName?: string,
    onlineUrl?: string,
  ): void {
    switch (type) {
      case LocationType.OFFLINE:
        if (!hallName) {
          throw new BadRequestException(
            'Hall name is required for OFFLINE events',
          );
        }
        if (onlineUrl) {
          throw new BadRequestException(
            'Online URL cannot be set for OFFLINE events',
          );
        }
        break;

      case LocationType.ONLINE:
        if (!onlineUrl) {
          throw new BadRequestException(
            'Online URL is required for ONLINE events',
          );
        }
        if (hallName) {
          throw new BadRequestException(
            'Hall name cannot be set for ONLINE events',
          );
        }
        break;

      case LocationType.HYBRID:
        if (!hallName && !onlineUrl) {
          throw new BadRequestException(
            'Hybrid session requires at least a Hall Name or an Online URL',
          );
        }
        break;
    }
  }

  async findAll(): Promise<SessionResponse[]> {
    const sessions = await this.sessionRepository.find({
      relations: ['event', 'speakers'],
    });
    return sessions.map((session) => new SessionResponse(session));
  }

  async findOne(id: number): Promise<SessionResponse> {
    const session = await this.getSessionWithRelations(id);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return new SessionResponse(session);
  }

  async getSessionWithRelations(id: number): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { id },
      relations: ['event', 'speakers'],
    });
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<SessionResponse> {
    const session = await this.getSessionWithRelations(id);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    await this.ensureCanManageEvent(session.event.id, currentUser);
    Object.assign(session, updateSessionDto);
    const updatedSession = await this.sessionRepository.save(session);
    const updatedSessionWithRelations = await this.getSessionWithRelations(
      updatedSession.id,
    );
    if (!updatedSessionWithRelations) {
      throw new NotFoundException('Failed to load updated session');
    }
    return new SessionResponse(updatedSessionWithRelations);
  }

  async addSpeaker(
    sessionId: number,
    speakerId: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<SessionResponse> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['event', 'speakers'],
    });

    if (!session) {
      throw new NotFoundException(`Session with id ${sessionId} not found`);
    }

    await this.ensureCanManageEvent(session.event.id, currentUser);

    const speaker = await this.speakerRepository.findOneBy({ id: speakerId });
    if (!speaker) {
      throw new NotFoundException(`Speaker with id ${speakerId} not found`);
    }

    const isSpeakerAssigned =
      session.speakers?.some((s) => s.id === speakerId) || false;
    if (isSpeakerAssigned) {
      throw new BadRequestException(
        'Speaker is already assigned to this session',
      );
    }

    session.speakers = [...(session.speakers || []), speaker];
    const updatedSession = await this.sessionRepository.save(session);
    return new SessionResponse(updatedSession);
  }

  async removeSpeaker(
    sessionId: number,
    speakerId: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<SessionResponse> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['event', 'speakers'],
    });

    if (!session) {
      throw new NotFoundException(`Session with id ${sessionId} not found`);
    }

    await this.ensureCanManageEvent(session.event.id, currentUser);

    const speakers = session.speakers || [];
    const speakerIndex = speakers.findIndex((s) => s.id === speakerId);
    if (speakerIndex === -1) {
      throw new BadRequestException('Speaker is not assigned to this session');
    }

    session.speakers.splice(speakerIndex, 1);
    const updatedSession = await this.sessionRepository.save(session);
    return new SessionResponse(updatedSession);
  }

  async remove(
    id: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<void> {
    const session = await this.getSessionWithRelations(id);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    if (!session.event) {
      throw new Error(`Session ${id} has no associated event`);
    }

    await this.ensureCanManageEvent(session.event.id, currentUser);
    await this.sessionRepository.remove(session);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateSessionStatusesBySchedule(): Promise<void> {
    const now = new Date();

    await this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({ status: SessionStatus.LIVE })
      .where('status = :status', { status: SessionStatus.UPCOMING })
      .andWhere('start_time <= :now', { now })
      .andWhere('end_time > :now', { now })
      .execute();

    await this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({ status: SessionStatus.COMPLETED })
      .where('status IN (:...statuses)', {
        statuses: [SessionStatus.UPCOMING, SessionStatus.LIVE],
      })
      .andWhere('end_time <= :now', { now })
      .execute();
  }
}
