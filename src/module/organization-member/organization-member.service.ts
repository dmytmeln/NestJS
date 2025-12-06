import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMember } from './entities/organization-member.entity';
import { OrganizationMemberRole } from './organization-member-role.enum';
import { OrganizationMemberResponse } from './dto/organization-member-response.dto';

@Injectable()
export class OrganizationMemberService {
  constructor(
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(
    userId: number,
    organizationId: number,
    role: OrganizationMemberRole,
  ): Promise<OrganizationMemberResponse> {
    const member = this.memberRepository.create({
      user: { id: userId },
      organization: { id: organizationId },
      role,
    });
    const savedMember = await this.memberRepository.save(member);
    const memberWithRelations = await this.memberRepository.findOne({
      where: { id: savedMember.id },
      relations: ['user', 'organization'],
    });
    return new OrganizationMemberResponse(memberWithRelations!);
  }

  async findAll(): Promise<OrganizationMemberResponse[]> {
    const members = await this.memberRepository.find({
      relations: ['user', 'organization'],
    });
    return members.map((member) => new OrganizationMemberResponse(member));
  }

  async findOne(id: number): Promise<OrganizationMemberResponse> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['user', 'organization'],
    });

    if (!member) {
      throw new NotFoundException(
        `Organization member with id ${id} not found`,
      );
    }

    return new OrganizationMemberResponse(member);
  }

  async findByOrganization(
    organizationId: number,
  ): Promise<OrganizationMemberResponse[]> {
    const members = await this.memberRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['user', 'organization'],
    });
    return members.map((member) => new OrganizationMemberResponse(member));
  }

  async findByUser(userId: number): Promise<OrganizationMemberResponse[]> {
    const members = await this.memberRepository.find({
      where: { user: { id: userId } },
      relations: ['organization', 'user'],
    });
    return members.map((member) => new OrganizationMemberResponse(member));
  }

  async updateRole(
    id: number,
    role: OrganizationMemberRole,
  ): Promise<OrganizationMemberResponse> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['user', 'organization'],
    });

    if (!member) {
      throw new NotFoundException(
        `Organization member with id ${id} not found`,
      );
    }

    member.role = role;
    const updatedMember = await this.memberRepository.save(member);
    return new OrganizationMemberResponse(updatedMember);
  }

  async getMemberEntity(
    userId: number,
    organizationId: number,
  ): Promise<OrganizationMember | null> {
    return this.memberRepository.findOne({
      where: { user: { id: userId }, organization: { id: organizationId } },
      relations: ['user', 'organization'],
    });
  }

  async findByUserAndOrganization(
    userId: number,
    organizationId: number,
  ): Promise<OrganizationMemberResponse | null> {
    const member = await this.getMemberEntity(userId, organizationId);
    return member ? new OrganizationMemberResponse(member) : null;
  }

  async remove(id: number): Promise<void> {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException(
        `Organization member with id ${id} not found`,
      );
    }
    await this.memberRepository.remove(member);
  }
}
