import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationMemberRole } from '../organization-member/organization-member-role.enum';
import { UserRole } from '../auth/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.organizationService.create(createOrganizationDto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.organizationService.findAll();
  }

  @Get('my')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  findAllMy(@Request() req: { user: { userId: number; role: UserRole } }) {
    return this.organizationService.findOrganizationsByMemberId(
      req.user.userId,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.organizationService.findOne(+id, req.user);
  }

  @Get(':id/members')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  getMembers(
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.organizationService.getMembers(+id, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.organizationService.update(
      +id,
      updateOrganizationDto,
      req.user,
    );
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  addMember(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Request() req: { user: { userId: number } },
  ) {
    return this.organizationService.addMember(+userId, +id, req.user.userId);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: { user: { userId: number } },
  ) {
    return this.organizationService.removeMember(+id, req.user.userId, +userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.organizationService.remove(+id, req.user);
  }
}
