import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationMemberService } from '../organization-member/organization-member.service';
import { OrganizationMemberRole } from '../organization-member/organization-member-role.enum';
import { UserService } from '../user/user.service';
import { UserRole } from '../auth/roles.enum';
import { OrganizationMember } from '../organization-member/entities/organization-member.entity';
import { OrganizationResponse } from './dto/organization-response.dto';
import { OrganizationMemberResponse } from '../organization-member/dto/organization-member-response.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private organizationMemberService: OrganizationMemberService,
    private userService: UserService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<OrganizationResponse> {
    const organization = this.organizationRepository.create(
      createOrganizationDto,
    );
    const saved = await this.organizationRepository.save(organization);

    if (currentUser.role === UserRole.ORGANIZER) {
      await this.organizationMemberService.create(
        currentUser.userId,
        saved.id,
        OrganizationMemberRole.ADMIN,
      );
    }

    // Reload with relations to get counts
    const organizationWithRelations = await this.organizationRepository.findOne(
      {
        where: { id: saved.id },
        relations: ['members', 'events'],
      },
    );

    return new OrganizationResponse(organizationWithRelations!);
  }

  async findAll(): Promise<OrganizationResponse[]> {
    const organizations = await this.organizationRepository.find({
      relations: ['members', 'events'],
    });
    return organizations.map((org) => new OrganizationResponse(org));
  }

  async findOne(
    id: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<OrganizationResponse> {
    if (currentUser.role !== UserRole.ADMIN) {
      await this.getMembershipOrThrow(id, currentUser.userId);
    }

    return this.getOrganizationWithRelations(id);
  }

  private async getOrganizationWithRelations(
    id: number,
  ): Promise<OrganizationResponse> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['members', 'events'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }

    return new OrganizationResponse(organization);
  }

  async update(
    id: number,
    updateOrganizationDto: UpdateOrganizationDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<OrganizationResponse> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['members', 'events'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }

    // Only admin or organization admin can update
    if (currentUser.role !== UserRole.ADMIN) {
      const membership =
        await this.organizationMemberService.findByUserAndOrganization(
          currentUser.userId,
          id,
        );

      if (!membership || membership.role !== OrganizationMemberRole.ADMIN) {
        throw new ForbiddenException(
          'You do not have permission to update this organization',
        );
      }
    }

    Object.assign(organization, updateOrganizationDto);
    const updatedOrg = await this.organizationRepository.save(organization);

    // Reload with relations to get updated counts
    const updatedOrgWithRelations = await this.organizationRepository.findOne({
      where: { id: updatedOrg.id },
      relations: ['members', 'events'],
    });

    return new OrganizationResponse(updatedOrgWithRelations!);
  }

  async remove(
    id: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<void> {
    const organization = await this.organizationRepository.findOneBy({ id });

    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }

    if (currentUser.role !== UserRole.ADMIN) {
      const membership =
        await this.organizationMemberService.findByUserAndOrganization(
          currentUser.userId,
          id,
        );

      if (!membership || membership.role !== OrganizationMemberRole.ADMIN) {
        throw new ForbiddenException(
          'You do not have permission to delete this organization',
        );
      }
    }

    await this.organizationRepository.remove(organization);
  }

  async getMembers(
    organizationId: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<OrganizationMemberResponse[]> {
    if (currentUser.role !== UserRole.ADMIN) {
      await this.getMembershipOrThrow(organizationId, currentUser.userId);
    }

    return this.organizationMemberService.findByOrganization(organizationId);
  }

  private async getMembershipOrThrow(
    organizationId: number,
    currentUserId: number,
  ): Promise<OrganizationMember> {
    const membership = await this.organizationMemberService.getMemberEntity(
      currentUserId,
      organizationId,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return membership;
  }

  async addMember(
    targetUserId: number,
    organizationId: number,
    currentUserId: number,
  ) {
    const currentMembership = await this.getMembershipOrThrow(
      organizationId,
      currentUserId,
    );

    if (currentMembership.role !== OrganizationMemberRole.ADMIN) {
      throw new ForbiddenException(
        'Only admin can manage organization members',
      );
    }

    const user = await this.userService.findEntity(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing =
      await this.organizationMemberService.findByUserAndOrganization(
        user.id,
        organizationId,
      );

    if (existing) {
      throw new BadRequestException(
        'User is already a member of this organization',
      );
    }

    return this.organizationMemberService.create(
      user.id,
      organizationId,
      OrganizationMemberRole.MEMBER,
    );
  }

  async findOrganizationsByMemberId(
    memberId: number,
  ): Promise<OrganizationResponse[]> {
    const memberships =
      await this.organizationMemberService.findByUser(memberId);

    if (memberships.length === 0) {
      return [];
    }

    const organizationIds = memberships.map((m) => m.organizationId);

    const organizations = await this.organizationRepository.find({
      where: { id: In(organizationIds) },
      relations: ['members', 'events'],
    });

    return organizations.map((org) => new OrganizationResponse(org));
  }

  async removeMember(
    organizationId: number,
    currentUserId: number,
    targetUserId: number,
  ): Promise<void> {
    const currentMembership = await this.getMembershipOrThrow(
      organizationId,
      currentUserId,
    );

    const targetMembership =
      await this.organizationMemberService.findByUserAndOrganization(
        targetUserId,
        organizationId,
      );

    if (!targetMembership) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (currentMembership.role !== OrganizationMemberRole.ADMIN) {
      throw new ForbiddenException(
        'Only admin can remove organization members',
      );
    }

    await this.organizationMemberService.remove(targetMembership.id);
  }
}
