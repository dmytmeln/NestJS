import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Speaker } from './entities/speaker.entity';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Injectable()
export class SpeakerService {
  constructor(
    @InjectRepository(Speaker)
    private speakerRepository: Repository<Speaker>,
  ) {}

  async create(createSpeakerDto: CreateSpeakerDto): Promise<Speaker> {
    const speaker = this.speakerRepository.create(createSpeakerDto);
    return this.speakerRepository.save(speaker);
  }

  async findAll(query?: { search?: string }): Promise<Speaker[]> {
    if (query?.search) {
      return this.speakerRepository.find({
        where: { name: ILike(`%${query.search}%`) },
      });
    }

    return this.speakerRepository.find();
  }

  async findOne(id: number): Promise<Speaker> {
    const speaker = await this.speakerRepository.findOneBy({ id });

    if (!speaker) {
      throw new NotFoundException(`Speaker with id ${id} not found`);
    }

    return speaker;
  }

  async update(
    id: number,
    updateSpeakerDto: UpdateSpeakerDto,
  ): Promise<Speaker> {
    const speaker = await this.findOne(id);
    Object.assign(speaker, updateSpeakerDto);
    return this.speakerRepository.save(speaker);
  }

  async remove(id: number): Promise<void> {
    const speaker = await this.findOne(id);
    await this.speakerRepository.remove(speaker);
  }
}
