import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Between, DeepPartial, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponse } from './dto/notification-response.dto';
import { Event } from '../event/entities/event.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { EventStatus } from 'src/module/event/event-status.enum';
import { formatInTimeZone } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private mailService: MailService,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponse> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    const savedNotification =
      await this.notificationRepository.save(notification);
    return new NotificationResponse(savedNotification);
  }

  async findAll(): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepository.find({
      relations: ['user'],
    });
    return notifications.map(
      (notification) => new NotificationResponse(notification),
    );
  }

  async findOne(id: number): Promise<NotificationResponse> {
    const notification = await this.findById(id);
    return new NotificationResponse(notification);
  }

  private async findById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return notification;
  }

  async findByUser(userId: number): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return notifications.map(
      (notification) => new NotificationResponse(notification),
    );
  }

  async markAsRead(id: number, userId: number): Promise<NotificationResponse> {
    const notification = await this.findById(id);

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    if (notification.user.id !== userId) {
      throw new ForbiddenException(
        'You can only modify your own notifications',
      );
    }

    notification.isRead = true;
    const updatedNotification =
      await this.notificationRepository.save(notification);
    return new NotificationResponse(updatedNotification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponse> {
    const notification = await this.findById(id);

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    Object.assign(notification, updateNotificationDto);
    const updatedNotification =
      await this.notificationRepository.save(notification);
    return new NotificationResponse(updatedNotification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findById(id);
    await this.notificationRepository.remove(notification);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async createEventReminders(): Promise<void> {
    const now = new Date();
    const targetStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const targetEnd = new Date(targetStart.getTime() + 60 * 60 * 1000);

    const events = await this.eventRepository.find({
      where: {
        startTime: Between(targetStart, targetEnd),
        status: EventStatus.PUBLISHED,
      },
      select: ['id', 'title', 'startTime'],
    });

    if (events.length === 0) return;

    const eventIds = events.map((e) => e.id);

    const tickets = await this.ticketRepository.find({
      where: { event: { id: In(eventIds) } },
      relations: ['user', 'event'],
    });

    if (tickets.length === 0) return;

    const userIds = tickets
      .map((t) => t.user?.id)
      .filter((id) => id !== undefined);

    if (userIds.length === 0) return;

    const existingNotifications = await this.notificationRepository.find({
      where: {
        eventId: In(eventIds),
        user: { id: In(userIds) },
        title: 'Event reminder',
      },
      select: {
        eventId: true,
        user: {
          id: true,
        },
      },
      relations: ['user'],
    });

    const sentSet = new Set(
      existingNotifications.map((n) => `${n.eventId}-${n.user.id}`),
    );

    const notificationsToSave: Notification[] = [];
    const emailPromises: Promise<any>[] = [];

    for (const ticket of tickets) {
      if (!ticket.user || !ticket.user.email) continue;

      const uniqueKey = `${ticket.event.id}-${ticket.user.id}`;

      if (sentSet.has(uniqueKey)) continue;

      const formattedDate = formatInTimeZone(
        ticket.event.startTime,
        'UTC',
        'dd MMMM yyyy, HH:mm',
        { locale: enUS },
      );
      const message = `Your event "${ticket.event.title}" starts at ${formattedDate} (UTC)`;

      const notification = this.notificationRepository.create({
        title: 'Event reminder',
        message,
        user: ticket.user,
        eventId: ticket.event.id,
      });

      notificationsToSave.push(notification);

      sentSet.add(uniqueKey);

      emailPromises.push(
        this.mailService
          .sendEventReminderEmail(ticket.user.email, 'Event reminder', message)
          .catch((err) => {
            console.error(
              `Failed to send email to user ${ticket.user.id}`,
              err,
            );
          }),
      );
    }

    if (notificationsToSave.length > 0) {
      await this.notificationRepository.save(notificationsToSave);
    }

    await Promise.allSettled(emailPromises);
  }
}
