import { Organization } from '../entities/organization.entity';

export class OrganizationResponse {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  type: string;

  membersCount?: number;
  eventsCount?: number;

  constructor(organization: Organization) {
    this.id = organization.id;
    this.name = organization.name;
    this.description = organization.description;
    this.logoUrl = organization.logoUrl;
    this.type = organization.type;

    if (organization.members) {
      this.membersCount = organization.members.length;
    }

    if (organization.events) {
      this.eventsCount = organization.events.length;
    }
  }
}
