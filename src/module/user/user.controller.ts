import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserResponse } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    return this.userService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    if (req.user.role !== UserRole.ADMIN && req.user.userId !== +id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.userService.update(+id, updateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    return this.userService.updateRole(+id, updateUserRoleDto.role, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
