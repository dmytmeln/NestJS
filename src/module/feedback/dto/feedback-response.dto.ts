import { Feedback } from '../entities/feedback.entity';

export class FeedbackResponse {
  id: number;
  rating: number;
  comment: string;

  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };

  eventId?: number;
  sessionId?: number;

  constructor(feedback: Feedback) {
    this.id = feedback.id;
    this.rating = feedback.rating;
    this.comment = feedback.comment;

    if (feedback.user) {
      this.user = {
        id: feedback.user.id,
        firstName: feedback.user.firstName,
        lastName: feedback.user.lastName,
      };
    }

    this.eventId = feedback.event?.id;
    this.sessionId = feedback.session?.id;
  }
}
