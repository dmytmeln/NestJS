import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from '../organization-member/entities/organization-member.entity';
import { OrganizationMemberService } from '../organization-member/organization-member.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationMember]),
    UserModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationMemberService],
})
export class OrganizationModule {}
