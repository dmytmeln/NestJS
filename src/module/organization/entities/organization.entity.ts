import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrganizationMember } from '../../organization-member/entities/organization-member.entity';
import { Event } from '../../event/entities/event.entity';
import { OrganizationType } from '../organization-type.enum';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
  })
  type: OrganizationType;

  @OneToMany(() => OrganizationMember, 'organization')
  members: OrganizationMember[];

  @OneToMany(() => Event, 'organization')
  events: Event[];
}
