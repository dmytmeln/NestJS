import { Event } from '../entities/event.entity';
import { EventStatus } from '../event-status.enum';

export class EventResponse {
  id: number;
  title: string;
  description: string;
  bannerImageUrl: string;
  startTime: Date;
  endTime: Date;
  locationType: string;
  locationAddress: string;
  onlineUrl: string;
  status: EventStatus;

  organization?: {
    id: number;
    name: string;
    logoUrl: string;
  };

  constructor(event: Event) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.bannerImageUrl = event.bannerImageUrl;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
    this.locationType = event.locationType;
    this.locationAddress = event.locationAddress;
    this.onlineUrl = event.onlineUrl;
    this.status = event.status;

    if (event.organization) {
      this.organization = {
        id: event.organization.id,
        name: event.organization.name,
        logoUrl: event.organization.logoUrl,
      };
    }
  }
}
