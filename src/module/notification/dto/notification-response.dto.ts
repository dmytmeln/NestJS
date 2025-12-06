import { Notification } from '../entities/notification.entity';

export class NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  sentViaEmail: boolean;
  eventId: number;
  createdAt: Date;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.title = notification.title;
    this.message = notification.message;
    this.isRead = notification.isRead;
    this.sentViaEmail = notification.sentViaEmail;
    this.eventId = notification.eventId;
    this.createdAt = notification.createdAt;
  }
}
