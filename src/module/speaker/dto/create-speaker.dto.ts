import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  socialLinks?: string;
}
