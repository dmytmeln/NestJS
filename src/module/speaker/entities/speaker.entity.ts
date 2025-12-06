import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('speakers')
export class Speaker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ name: 'social_links', type: 'text', nullable: true })
  socialLinks: string;
}
