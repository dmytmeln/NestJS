import { Speaker } from '../entities/speaker.entity';

export class SpeakerResponse {
  id: number;
  name: string;
  bio: string;
  photoUrl: string;
  socialLinks: string;

  constructor(speaker: Speaker) {
    this.id = speaker.id;
    this.name = speaker.name;
    this.bio = speaker.bio;
    this.photoUrl = speaker.photoUrl;
    this.socialLinks = speaker.socialLinks;
  }
}
