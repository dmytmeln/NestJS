import { Session } from '../entities/session.entity';
import { SessionStatus } from '../session-status.enum';

export class SessionResponse {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  hallName: string;
  onlineUrl: string;
  status: SessionStatus;

  event?: {
    id: number;
    title: string;
  };

  speakers?: {
    id: number;
    name: string;
    photoUrl: string;
  }[];

  constructor(session: Session) {
    this.id = session.id;
    this.title = session.title;
    this.startTime = session.startTime;
    this.endTime = session.endTime;
    this.hallName = session.hallName;
    this.onlineUrl = session.onlineUrl;
    this.status = session.status;

    if (session.event) {
      this.event = {
        id: session.event.id,
        title: session.event.title,
      };
    }

    if (session.speakers) {
      this.speakers = session.speakers.map((s) => ({
        id: s.id,
        name: s.name,
        photoUrl: s.photoUrl,
      }));
    }
  }
}
