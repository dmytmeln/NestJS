import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponse } from './dto/feedback-response.dto';
import { SessionService } from '../session/session.service';
import { UserRole } from '../auth/roles.enum';
import { OrganizationMemberService } from 'src/module/organization-member/organization-member.service';
import { EventService } from 'src/module/event/event.service';
import { TicketService } from '../ticket/ticket.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    private sessionService: SessionService,
    private eventService: EventService,
    private orgMemberService: OrganizationMemberService,
    private ticketService: TicketService,
  ) {}

  private async findFeedbackById(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user', 'event', 'session'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with id ${id} not found`);
    }

    return feedback;
  }

  async create(
    createFeedbackDto: CreateFeedbackDto,
    userId: number,
  ): Promise<FeedbackResponse> {
    const { sessionId, ...restFeedback } = createFeedbackDto;

    const session =
      await this.sessionService.getSessionWithRelations(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with id ${sessionId} not found`);
    }

    const hasTicket = await this.ticketService.hasValidTicketForEvent(
      userId,
      session.event.id,
    );

    if (!hasTicket) {
      throw new BadRequestException(
        'You can only leave feedback for events you participated in (bought a ticket for).',
      );
    }

    const existingFeedback = await this.feedbackRepository.findOne({
      where: { user: { id: userId }, session: { id: sessionId } },
    });

    if (existingFeedback) {
      throw new BadRequestException(
        'You have already left feedback for this session',
      );
    }

    const feedback = this.feedbackRepository.create({
      user: { id: userId },
      event: { id: session.event.id },
      session: { id: sessionId },
      ...restFeedback,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);
    const feedbackWithRelations = await this.findFeedbackById(savedFeedback.id);
    return new FeedbackResponse(feedbackWithRelations);
  }

  async findAll(): Promise<FeedbackResponse[]> {
    const feedbacks = await this.feedbackRepository.find({
      relations: ['user', 'event', 'session'],
    });
    return feedbacks.map((feedback) => new FeedbackResponse(feedback));
  }

  async findOne(id: number): Promise<FeedbackResponse> {
    const feedback = await this.findFeedbackById(id);
    return new FeedbackResponse(feedback);
  }

  async update(
    id: number,
    updateFeedbackDto: UpdateFeedbackDto,
    user: { userId: number; role: UserRole },
  ): Promise<FeedbackResponse> {
    const feedback = await this.findFeedbackById(id);
    if (feedback.user.id !== user.userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to update this feedback',
      );
    }

    Object.assign(feedback, updateFeedbackDto);
    const updatedFeedback = await this.feedbackRepository.save(feedback);
    const feedbackWithRelations = await this.findFeedbackById(
      updatedFeedback.id,
    );

    return new FeedbackResponse(feedbackWithRelations);
  }

  async remove(
    id: number,
    user: { userId: number; role: UserRole },
  ): Promise<void> {
    const feedback = await this.findFeedbackById(id);
    if (feedback.user.id !== user.userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to delete this feedback',
      );
    }
    await this.feedbackRepository.remove(feedback);
  }

  async findByEvent(
    eventId: number,
    user: { userId: number; role: UserRole },
  ): Promise<FeedbackResponse[]> {
    const event = await this.eventService.findEventById(eventId);
    this.eventService.ensureCanManageOrganization(event.organization.id, user);

    const feedbacks = await this.feedbackRepository.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event', 'session'],
    });
    return feedbacks.map((feedback) => new FeedbackResponse(feedback));
  }
}
