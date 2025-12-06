import { OrganizationMember } from '../entities/organization-member.entity';

export class OrganizationMemberResponse {
  id: number;
  role: string;
  organizationId: number;

  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };

  constructor(member: OrganizationMember) {
    this.id = member.id;
    this.role = member.role;
    this.organizationId = member.organization.id;
    this.user = {
      id: member.user.id,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    };
  }
}
