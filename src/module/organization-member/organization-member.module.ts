import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMember } from './entities/organization-member.entity';
import { OrganizationMemberService } from './organization-member.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMember])],
  providers: [OrganizationMemberService],
  exports: [OrganizationMemberService],
})
export class OrganizationMemberModule {}
