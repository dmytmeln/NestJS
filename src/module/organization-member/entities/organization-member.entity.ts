import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationMemberRole } from '../organization-member-role.enum';

@Entity('organization_members')
export class OrganizationMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: OrganizationMemberRole.MEMBER,
  })
  role: OrganizationMemberRole;

  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization, (org) => org.members)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
